import asyncWrapper from '../middleware/asyncWrapper.js'
import Hostel from '../models/Hostel.js'
import { sendResponse } from '../utils/apiResponse.js'
import logger from '../utils/logger.js'

const parseSortToObject = (sort) => {
  if (!sort) return { createdAt: -1 }
  // allow comma separated multi-sort: "-createdAt,price"
  const parts = sort.split(',').map(s => s.trim()).filter(Boolean)
  const sortObj = {}
  parts.forEach(p => {
    if (p.startsWith('-')) {
      sortObj[p.slice(1)] = -1
    } else {
      sortObj[p] = 1
    }
  })
  return sortObj
}

export const createHostel = asyncWrapper(async (req, res) => {
  const {
    name,
    description,
    price,
    lat,
    lng,
    address,
    availableRooms,
    amenities,
    rentDuration,
    images
  } = req.body

  if (lat == null || lng == null || !address) {
    return sendResponse(res, 400, false, 'Location coordinates and address are required')
  }

  const coordinates = [parseFloat(lng), parseFloat(lat)]

  const status = process.env.AUTO_APPROVE_HOSTELS === 'true' ? 'approved' : 'pending'

  const hostel = await Hostel.create({
    owner: req.user._id,
    name,
    description,
    price: parseFloat(price),
    location: {
      type: 'Point',
      coordinates,
      address
    },
    availableRooms: parseInt(availableRooms) || 0,
    initialRooms: parseInt(availableRooms) || 0,
    amenities: Array.isArray(amenities) ? amenities : [],
    rentDuration: rentDuration || 'monthly',
    images: Array.isArray(images) ? images : [],
    status
  })

  logger.info(`Hostel created: ${hostel.name} by ${req.user.email}`)

  return sendResponse(res, 201, true, 'Hostel created successfully', {
    hostel
  })
})

export const getHostels = asyncWrapper(async (req, res) => {
  // parse numeric query params properly
  const pageNum = req.query.page ? parseInt(req.query.page, 10) : 1
  // treat absent limit as "no limit". If a client sends limit=0 or doesn't send limit, we'll NOT apply limit.
  const limitNum = (req.query.limit !== undefined && req.query.limit !== '') ? parseInt(req.query.limit, 10) : 0
  const {
    minPrice,
    maxPrice,
    amenities,
    lat,
    lng,
    radiusKm = 10,
    sort = '-createdAt',
    status,
    search
  } = req.query

  const skip = pageNum > 0 && limitNum > 0 ? (pageNum - 1) * limitNum : 0

  // Build base query
  let query = { isActive: true }

  // Status filtering: admin may use `status` param; others always see approved
  const user = req.user
  if (user && user.role === 'admin') {
    if (status) query.status = status
  } else if (user && user.role === 'owner') {
    // Owner sees approved hostels OR their own pending/rejected hostels
    query.$or = [
      { status: 'approved' },
      { owner: user._id }
    ]
  } else {
    // Public/unauthenticated user sees only approved hostels.
    query.status = 'approved'
  }

  // Price range
  if (minPrice || maxPrice) {
    query.price = {}
    if (minPrice !== undefined && minPrice !== '') query.price.$gte = parseFloat(minPrice)
    if (maxPrice !== undefined && maxPrice !== '') query.price.$lte = parseFloat(maxPrice)
  }

  // Amenities: guard against empty strings
  if (amenities) {
    const amenityArray = amenities.split(',').map(a => a.trim()).filter(Boolean)
    if (amenityArray.length > 0) {
      query.amenities = { $all: amenityArray }
    }
  }

  // Search (text)
  if (search) {
    query.$text = { $search: search }
  }

  let hostels = []
  let total = 0

  const sortObj = parseSortToObject(sort)

  // Geospatial query when coords provided
  if (lat && lng) {
    const coordinates = [parseFloat(lng), parseFloat(lat)]
    const radiusInMeters = parseFloat(radiusKm) * 1000

    // Build aggregation pipeline conditionally adding skip/limit
    const pipeline = [
      {
        $geoNear: {
          near: { type: 'Point', coordinates },
          distanceField: 'distance',
          spherical: true,
          maxDistance: radiusInMeters,
          query
        }
      },
      { $sort: sortObj }
    ]

    if (skip > 0) pipeline.push({ $skip: skip })
    if (limitNum > 0) pipeline.push({ $limit: limitNum })

    pipeline.push(
      {
        $lookup: {
          from: 'users',
          localField: 'owner',
          foreignField: '_id',
          as: 'owner'
        }
      },
      { $unwind: '$owner' },
      {
        $project: {
          'owner.password': 0,
          'owner.refreshToken': 0,
          'owner.__v': 0
        }
      }
    )

    const countPipeline = [
      {
        $geoNear: {
          near: { type: 'Point', coordinates },
          distanceField: 'distance',
          spherical: true,
          maxDistance: radiusInMeters,
          query
        }
      },
      { $count: 'total' }
    ]

    hostels = await Hostel.aggregate(pipeline)
    const countResult = await Hostel.aggregate(countPipeline)
    total = countResult[0]?.total || 0
  } else {
    // Regular (non-geospatial) query
    const queryExec = Hostel.find(query).populate('owner', 'name email phone avatar').sort(sortObj)
    if (limitNum > 0) {
      queryExec.skip(skip).limit(limitNum)
    }
    hostels = await queryExec.exec()
    total = await Hostel.countDocuments(query)
  }

  return sendResponse(res, 200, true, 'Hostels retrieved', {
    hostels,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: limitNum > 0 ? Math.ceil(total / limitNum) : 1
    }
  })
})

export const getHostel = asyncWrapper(async (req, res) => {
  let query = { _id: req.params.id, isActive: true }
  if (req.user.role !== 'admin') {
    query.status = 'approved'
  }

  const hostel = await Hostel.findOne(query).populate('owner', 'name email phone avatar')

  if (!hostel) {
    return sendResponse(res, 404, false, 'Hostel not found')
  }

  return sendResponse(res, 200, true, 'Hostel retrieved', {
    hostel
  })
})

export const updateHostel = asyncWrapper(async (req, res) => {
  const hostel = await Hostel.findById(req.params.id)

  if (!hostel) {
    return sendResponse(res, 404, false, 'Hostel not found')
  }

  if (req.user.role !== 'admin' && hostel.owner.toString() !== req.user._id.toString()) {
    return sendResponse(res, 403, false, 'Not authorized to update this hostel')
  }

  const updates = { ...req.body }

  if (updates.lat && updates.lng) {
    updates.location = {
      type: 'Point',
      coordinates: [parseFloat(updates.lng), parseFloat(updates.lat)],
      address: updates.address || hostel.location.address
    }
    delete updates.lat
    delete updates.lng
    delete updates.address
  }

  if (updates.availableRooms !== undefined) {
    const newAvailableRooms = parseInt(updates.availableRooms, 10)
    if (newAvailableRooms > hostel.initialRooms) {
      updates.availableRooms = hostel.initialRooms
    }
  }

  if (req.user.role !== 'admin' && hostel.status === 'approved') {
    const significantFields = ['name', 'description', 'price', 'location', 'amenities']
    const hasSignificantChanges = significantFields.some(field => updates[field] !== undefined)
    if (hasSignificantChanges) {
      updates.status = 'pending'
    }
  }

  const updatedHostel = await Hostel.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true
  }).populate('owner', 'name email phone avatar')

  logger.info(`Hostel updated: ${updatedHostel.name} by ${req.user.email}`)

  return sendResponse(res, 200, true, 'Hostel updated successfully', {
    hostel: updatedHostel
  })
})

export const deleteHostel = asyncWrapper(async (req, res) => {
  const hostel = await Hostel.findById(req.params.id)

  if (!hostel) {
    return sendResponse(res, 404, false, 'Hostel not found')
  }

  if (req.user.role !== 'admin' && hostel.owner.toString() !== req.user._id.toString()) {
    return sendResponse(res, 403, false, 'Not authorized to delete this hostel')
  }

  hostel.isActive = false
  await hostel.save()

  logger.warn(`Hostel deleted: ${hostel.name} by ${req.user.email}`)

  return sendResponse(res, 200, true, 'Hostel deleted successfully')
})

export const updateHostelStatus = asyncWrapper(async (req, res) => {
  const { status } = req.body

  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return sendResponse(res, 400, false, 'Invalid status')
  }

  const hostel = await Hostel.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true }).populate('owner', 'name email')

  if (!hostel) {
    return sendResponse(res, 404, false, 'Hostel not found')
  }

  logger.info(`Hostel status updated: ${hostel.name} -> ${status} by ${req.user.email}`)

  return sendResponse(res, 200, true, 'Hostel status updated successfully', {
    hostel
  })
})

export const getMyHostels = asyncWrapper(async (req, res) => {
  const pageNum = req.query.page ? parseInt(req.query.page, 10) : 1
  const limitNum = (req.query.limit !== undefined && req.query.limit !== '') ? parseInt(req.query.limit, 10) : 0
  const skip = pageNum > 0 && limitNum > 0 ? (pageNum - 1) * limitNum : 0
  const { status } = req.query

  const query = {
    owner: req.user._id,
    isActive: true
  }

  if (status) {
    query.status = status
  }

  const q = Hostel.find(query).sort('-createdAt')
  if (limitNum > 0) q.skip(skip).limit(limitNum)
  const hostels = await q.exec()
  const total = await Hostel.countDocuments(query)

  return sendResponse(res, 200, true, 'My hostels retrieved', {
    hostels,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: limitNum > 0 ? Math.ceil(total / limitNum) : 1
    }
  })
})
