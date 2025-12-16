// src/components/hostels/HostelFilters.jsx - FINAL REWRITE (State-Driven with Apply Button)
import React, { useState, useEffect } from "react";
import { AMENITIES } from "../../utils/constants";
import {
  FaFilter,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaSearchLocation,
  FaCheck,
} from "react-icons/fa";
import "./HostelFilters.css";

const HostelFilters = ({ onFilterChange, currentFilters }) => {
  // 1. Local State: Tracks all changes before applying them to the URL
  const [localFilters, setLocalFilters] = useState({
    minPrice: currentFilters.minPrice || "",
    maxPrice: currentFilters.maxPrice || "",
    amenities: currentFilters.amenities || [],
    radiusKm: currentFilters.radiusKm || "5",
  });
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    radius: true,
    amenities: true,
  }); // 2. Sync local state with props only when currentFilters (from URL) changes

  useEffect(() => {
    setLocalFilters({
      minPrice: currentFilters.minPrice || "",
      maxPrice: currentFilters.maxPrice || "",
      amenities: currentFilters.amenities || [],
      radiusKm: currentFilters.radiusKm || "5",
    });
  }, [currentFilters]); // Helper function to update any single filter in the local state

  const updateLocalFilter = (key, value) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handlePriceChange = (type, value) => {
    updateLocalFilter(type, value);
  };

  const handleAmenityToggle = (amenity) => {
    const currentAmenities = localFilters.amenities;
    const newAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter((a) => a !== amenity)
      : [...currentAmenities, amenity];
    updateLocalFilter("amenities", newAmenities);
  };

  const handleRadiusChange = (value) => {
    updateLocalFilter("radiusKm", value);
  }; // 3. The function that triggers the final update to the parent/URL
  const applyFilters = () => {
    // This single call sends all local state changes to Hostels.jsx
    // to update the URL (setSearchParams) only once.
    onFilterChange(localFilters);
  }; // Helper function to determine if local changes exist compared to URL state

  const isFilterApplied = () => {
    const props = currentFilters;
    const local = localFilters; // Check for price changes

    const minPriceChanged = local.minPrice !== (props.minPrice || "");
    const maxPriceChanged = local.maxPrice !== (props.maxPrice || ""); // Check for radius change (default is '5')

    const radiusChanged = local.radiusKm !== (props.radiusKm || "5"); // Check for amenity array difference
    const propsAmenities = props.amenities || [];
    const localAmenities = local.amenities;

    const amenitiesChanged =
      localAmenities.length !== propsAmenities.length ||
      localAmenities.some((a) => !propsAmenities.includes(a));
    return (
      minPriceChanged || maxPriceChanged || radiusChanged || amenitiesChanged
    );
  };

  const clearAllFilters = () => {
    // Reset local state
    setLocalFilters({
      minPrice: "",
      maxPrice: "",
      amenities: [],
      radiusKm: "5",
    }); // Reset URL state immediately
    onFilterChange({
      minPrice: "",
      maxPrice: "",
      amenities: [],
      radiusKm: "5",
    });
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const visibleAmenities = showAllAmenities ? AMENITIES : AMENITIES.slice(0, 8);

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div className="hostelhub-filters-panel-content">
           {" "}
      <div className="hostelhub-filters-header">
               {" "}
        <h3 className="hostelhub-filters-title">
                    <FaFilter className="hostelhub-filter-main-icon" />         
          Filter Hostels        {" "}
        </h3>
               {" "}
        {/* Clear All Button: Checks active filters in the URL state (currentFilters) */}
               {" "}
        {Object.values(currentFilters).some(
          (filter) =>
            (Array.isArray(filter) && filter.length > 0) ||
            (typeof filter === "string" &&
              filter.trim() !== "" &&
              filter !== "5") ||
            (typeof filter === "number" && filter > 0)
        ) && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="hostelhub-clear-filters-button"
          >
                        <FaTimes className="hostelhub-clear-icon" />           
            Clear All          {" "}
          </button>
        )}
             {" "}
      </div>
            {/* Price Range Section */}     {" "}
      <div className="hostelhub-filter-section">
               {" "}
        <div
          className="hostelhub-filter-section-header"
          onClick={() => toggleSection("price")}
        >
                   {" "}
          <h4 className="hostelhub-filter-section-title">Price Range</h4>       
           {" "}
          <span className="hostelhub-filter-toggle">
                       {" "}
            {expandedSections.price ? <FaChevronUp /> : <FaChevronDown />}     
               {" "}
          </span>
                 {" "}
        </div>
                       {" "}
        {expandedSections.price && (
          <div className="hostelhub-filter-section-content">
                       {" "}
            <div className="hostelhub-price-display">
                           {" "}
              <div className="hostelhub-price-min">
                               {" "}
                <span className="hostelhub-price-label">From</span>             
                 {" "}
                <span className="hostelhub-price-value">
                                    GH₵
                  {localFilters.minPrice
                    ? formatPrice(localFilters.minPrice)
                    : "0"}
                                 {" "}
                </span>
                             {" "}
              </div>
                            <div className="hostelhub-price-divider">-</div>   
                       {" "}
              <div className="hostelhub-price-max">
                               {" "}
                <span className="hostelhub-price-label">To</span>               {" "}
                <span className="hostelhub-price-value">
                                    GH₵
                  {localFilters.maxPrice
                    ? formatPrice(localFilters.maxPrice)
                    : "10,000"}
                                 {" "}
                </span>
                             {" "}
              </div>
                         {" "}
            </div>
                                   {" "}
            <div className="hostelhub-price-slider-container">
                           {" "}
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={localFilters.maxPrice || 5000}
                onChange={(e) => handlePriceChange("maxPrice", e.target.value)}
                className="hostelhub-price-slider"
              />
                           {" "}
              <div className="hostelhub-slider-ticks">
                                <span>GH₵0</span>               {" "}
                <span>GH₵2,500</span>                <span>GH₵5,000</span>     
                          <span>GH₵7,500</span>               {" "}
                <span>GH₵10,000</span>             {" "}
              </div>
                         {" "}
            </div>
                                   {" "}
            <div className="hostelhub-price-inputs">
                           {" "}
              <div className="hostelhub-price-input-group">
                               {" "}
                <label className="hostelhub-price-input-label">Min Price</label>
                               {" "}
                <div className="hostelhub-price-input-wrapper">
                                   {" "}
                  <span className="hostelhub-currency-symbol">GH₵</span>
                                   {" "}
                  <input
                    type="number"
                    placeholder="0"
                    value={localFilters.minPrice}
                    onChange={(e) =>
                      handlePriceChange("minPrice", e.target.value)
                    }
                    className="hostelhub-price-input"
                    min="0"
                    step="100"
                  />
                                 {" "}
                </div>
                             {" "}
              </div>
                                         {" "}
              <div className="hostelhub-price-input-group">
                               {" "}
                <label className="hostelhub-price-input-label">Max Price</label>
                               {" "}
                <div className="hostelhub-price-input-wrapper">
                                   {" "}
                  <span className="hostelhub-currency-symbol">GH₵</span>
                                   {" "}
                  <input
                    type="number"
                    placeholder="10000"
                    value={localFilters.maxPrice}
                    onChange={(e) =>
                      handlePriceChange("maxPrice", e.target.value)
                    }
                    className="hostelhub-price-input"
                    min="0"
                    step="100"
                  />
                                 {" "}
                </div>
                             {" "}
              </div>
                         {" "}
            </div>
                     {" "}
          </div>
        )}
             {" "}
      </div>
            {/* Radius Section */}     {" "}
      <div className="hostelhub-filter-section">
               {" "}
        <div
          className="hostelhub-filter-section-header"
          onClick={() => toggleSection("radius")}
        >
                   {" "}
          <h4 className="hostelhub-filter-section-title">
                        <FaSearchLocation className="hostelhub-filter-icon" /> 
                      Search Radius          {" "}
          </h4>
                   {" "}
          <span className="hostelhub-filter-toggle">
                       {" "}
            {expandedSections.radius ? <FaChevronUp /> : <FaChevronDown />}     
               {" "}
          </span>
                 {" "}
        </div>
                       {" "}
        {expandedSections.radius && (
          <div className="hostelhub-filter-section-content">
                       {" "}
            <div className="hostelhub-radius-visual">
                           {" "}
              <div className="hostelhub-radius-circles">
                               {" "}
                {[1, 3, 5, 10, 20].map((km) => (
                  <div
                    key={km}
                    className={`hostelhub-radius-circle ${
                      localFilters.radiusKm === km.toString()
                        ? "hostelhub-radius-circle-active"
                        : ""
                    }`}
                    data-distance={km}
                    onClick={() => handleRadiusChange(km.toString())}
                  >
                                       {" "}
                    <span className="hostelhub-radius-circle-text">{km}km</span>
                                     {" "}
                  </div>
                ))}
                             {" "}
              </div>
                         {" "}
            </div>
                                   {" "}
            <div className="hostelhub-radius-slider">
                           {" "}
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={localFilters.radiusKm}
                onChange={(e) => handleRadiusChange(e.target.value)}
                className="hostelhub-radius-range"
              />
                           {" "}
              <div className="hostelhub-radius-slider-labels">
                                <span>1km</span>                <span>5km</span>
                                <span>10km</span>               {" "}
                <span>15km</span>                <span>20km</span>             {" "}
              </div>
                         {" "}
            </div>
                                   {" "}
            <div className="hostelhub-radius-selected">
                           {" "}
              <div className="hostelhub-radius-indicator">
                               {" "}
                <div className="hostelhub-radius-indicator-circle"></div>       
                       {" "}
                <div className="hostelhub-radius-indicator-text">
                                    Showing hostels within{" "}
                  <strong>{localFilters.radiusKm} kilometers</strong> of your
                  location                {" "}
                </div>
                             {" "}
              </div>
                         {" "}
            </div>
                     {" "}
          </div>
        )}
             {" "}
      </div>
            {/* Amenities Section */}     {" "}
      <div className="hostelhub-filter-section">
               {" "}
        <div
          className="hostelhub-filter-section-header"
          onClick={() => toggleSection("amenities")}
        >
                   {" "}
          <h4 className="hostelhub-filter-section-title">
                        Amenities ({localFilters.amenities.length} selected)    
                 {" "}
          </h4>
                   {" "}
          <span className="hostelhub-filter-toggle">
                       {" "}
            {expandedSections.amenities ? <FaChevronUp /> : <FaChevronDown />} 
                   {" "}
          </span>
                 {" "}
        </div>
                       {" "}
        {expandedSections.amenities && (
          <div className="hostelhub-filter-section-content">
                        {/* Selected Amenities Tags */}           {" "}
            {localFilters.amenities.length > 0 && (
              <div className="hostelhub-selected-amenities-tags">
                               {" "}
                {localFilters.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="hostelhub-selected-amenity-tag"
                    onClick={() => handleAmenityToggle(amenity)}
                  >
                                        {amenity}
                                       {" "}
                    <FaTimes className="hostelhub-amenity-remove" />           
                         {" "}
                  </span>
                ))}
                             {" "}
              </div>
            )}
                                   {" "}
            <div className="hostelhub-amenities-grid">
                           {" "}
              {visibleAmenities.map((amenity) => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => handleAmenityToggle(amenity)}
                  className={`hostelhub-amenitybutton ${
                    localFilters.amenities.includes(amenity)
                      ? "hostelhub-amenity-button-active"
                      : ""
                  }`}
                >
                                    {amenity}                 {" "}
                  {localFilters.amenities.includes(amenity) && (
                    <FaCheck className="hostelhub-amenity-checked" />
                  )}
                                 {" "}
                </button>
              ))}
                         {" "}
            </div>
                                   {" "}
            {AMENITIES.length > 8 && (
              <button
                type="button"
                onClick={() => setShowAllAmenities(!showAllAmenities)}
                className="hostelhub-toggle-amenities"
              >
                               {" "}
                {showAllAmenities ? (
                  <>
                                       {" "}
                    <FaChevronUp className="hostelhub-toggle-icon" />           
                            Show Less Amenities                  {" "}
                  </>
                ) : (
                  <>
                                       {" "}
                    <FaChevronDown className="hostelhub-toggle-icon" />         
                              Show All {AMENITIES.length} Amenities            
                         {" "}
                  </>
                )}
                             {" "}
              </button>
            )}
                     {" "}
          </div>
        )}
             {" "}
      </div>
               {" "}
      {/* 4. The Dedicated Apply Button (Visible only when local state differs from URL state) */}
           {" "}
      {isFilterApplied() && (
        <div className="hostelhub-apply-button-wrapper">
                   {" "}
          <button
            type="button"
            onClick={applyFilters}
            className="hostelhub-apply-filters-button"
          >
                        Apply Filters          {" "}
          </button>
                 {" "}
        </div>
      )}
         {" "}
    </div>
  );
};

export default HostelFilters;
