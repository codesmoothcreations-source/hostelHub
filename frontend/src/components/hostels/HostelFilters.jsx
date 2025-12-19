import React, { useState, useEffect, useMemo } from "react";
import { AMENITIES } from "../../utils/constants";
import {
  FaFilter,
  FaChevronDown,
  FaChevronUp,
  FaSearchLocation,
  FaCheck,
  FaMoneyBillWave,
  FaMapMarkedAlt,
  FaTags,
  FaUndoAlt,
  FaTimes
} from "react-icons/fa";
import styles from "./HostelFilters.module.css";

const HostelFilters = ({ onFilterChange, currentFilters }) => {
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
  });

  useEffect(() => {
    setLocalFilters({
      minPrice: currentFilters.minPrice || "",
      maxPrice: currentFilters.maxPrice || "",
      amenities: currentFilters.amenities || [],
      radiusKm: currentFilters.radiusKm || "5",
    });
  }, [currentFilters]);

  const updateLocalFilter = (key, value) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleAmenityToggle = (amenity) => {
    const current = localFilters.amenities;
    const next = current.includes(amenity)
      ? current.filter((a) => a !== amenity)
      : [...current, amenity];
    updateLocalFilter("amenities", next);
  };

  const hasChanges = useMemo(() => {
    return JSON.stringify(localFilters) !== JSON.stringify({
      minPrice: currentFilters.minPrice || "",
      maxPrice: currentFilters.maxPrice || "",
      amenities: currentFilters.amenities || [],
      radiusKm: currentFilters.radiusKm || "5",
    });
  }, [localFilters, currentFilters]);

  const applyFilters = () => onFilterChange(localFilters);

  const clearAllFilters = () => {
    const defaultState = { minPrice: "", maxPrice: "", amenities: [], radiusKm: "5" };
    setLocalFilters(defaultState);
    onFilterChange(defaultState);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const visibleAmenities = showAllAmenities ? AMENITIES : AMENITIES.slice(0, 8);

  return (
    <div className={styles.filterCard}>
      {/* Header Area */}
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <div className={styles.iconBadge}><FaFilter /></div>
          <div>
            <h3>Filters</h3>
            <p>Refine your search</p>
          </div>
        </div>
        <button onClick={clearAllFilters} className={styles.resetBtn} title="Reset all">
          <FaUndoAlt />
        </button>
      </div>

      <div className={styles.scrollArea}>
        {/* Price Section */}
        <div className={`${styles.section} ${expandedSections.price ? styles.activeSection : ""}`}>
          <div className={styles.sectionToggle} onClick={() => toggleSection("price")}>
            <div className={styles.sectionLabel}>
              <FaMoneyBillWave className={styles.labelIcon} />
              <span>Budget (Monthly)</span>
            </div>
            {expandedSections.price ? <FaChevronUp /> : <FaChevronDown />}
          </div>
          
          {expandedSections.price && (
            <div className={styles.content}>
              <div className={styles.priceInputs}>
                <div className={styles.inputWrapper}>
                  <label>Min</label>
                  <input 
                    type="number" 
                    value={localFilters.minPrice} 
                    onChange={(e) => updateLocalFilter("minPrice", e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className={styles.inputWrapper}>
                  <label>Max</label>
                  <input 
                    type="number" 
                    value={localFilters.maxPrice} 
                    onChange={(e) => updateLocalFilter("maxPrice", e.target.value)}
                    placeholder="10000"
                  />
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={localFilters.maxPrice || 5000}
                onChange={(e) => updateLocalFilter("maxPrice", e.target.value)}
                className={styles.rangeInput}
              />
            </div>
          )}
        </div>

        {/* Radius Section */}
        <div className={`${styles.section} ${expandedSections.radius ? styles.activeSection : ""}`}>
          <div className={styles.sectionToggle} onClick={() => toggleSection("radius")}>
            <div className={styles.sectionLabel}>
              <FaMapMarkedAlt className={styles.labelIcon} />
              <span>Distance Radius</span>
            </div>
            {expandedSections.radius ? <FaChevronUp /> : <FaChevronDown />}
          </div>
          
          {expandedSections.radius && (
            <div className={styles.content}>
              <div className={styles.radiusPills}>
                {[1, 5, 10, 20].map(km => (
                  <button
                    key={km}
                    className={localFilters.radiusKm === km.toString() ? styles.pillActive : styles.pill}
                    onClick={() => updateLocalFilter("radiusKm", km.toString())}
                  >
                    {km}km
                  </button>
                ))}
              </div>
              <p className={styles.helperText}>Searching within {localFilters.radiusKm}km of campus</p>
            </div>
          )}
        </div>

        {/* Amenities Section */}
        <div className={`${styles.section} ${expandedSections.amenities ? styles.activeSection : ""}`}>
          <div className={styles.sectionToggle} onClick={() => toggleSection("amenities")}>
            <div className={styles.sectionLabel}>
              <FaTags className={styles.labelIcon} />
              <span>Amenities</span>
            </div>
            <span className={styles.countBadge}>{localFilters.amenities.length}</span>
          </div>
          
          {expandedSections.amenities && (
            <div className={styles.content}>
              <div className={styles.amenityList}>
                {visibleAmenities.map((amenity) => (
                  <button
                    key={amenity}
                    onClick={() => handleAmenityToggle(amenity)}
                    className={localFilters.amenities.includes(amenity) ? styles.tagActive : styles.tag}
                  >
                    {amenity}
                    {localFilters.amenities.includes(amenity) ? <FaCheck /> : null}
                  </button>
                ))}
              </div>
              <button 
                className={styles.expandLink} 
                onClick={() => setShowAllAmenities(!showAllAmenities)}
              >
                {showAllAmenities ? "Collapse list" : `+ View ${AMENITIES.length - 8} more`}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Action Button Container */}
      <div className={`${styles.footer} ${hasChanges ? styles.footerVisible : ""}`}>
        <button onClick={applyFilters} className={styles.applyBtn}>
          Show Results
        </button>
      </div>
    </div>
  );
};

export default HostelFilters;