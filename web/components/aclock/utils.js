/**
 * Convert a timezone to a city name for URL
 * @param {string} timezone - Full timezone string (e.g., "America/New_York")
 * @returns {string} City name for URL (e.g., "new-york")
 */
export function timezoneToCityName(timezone) {
  if (!timezone) return "";
  // Get the part after the last slash, convert to lowercase, replace underscores with hyphens
  return timezone.split("/").pop().toLowerCase().replace(/_/g, "-");
}

/**
 * Convert a city name from URL back to full timezone
 * @param {string} cityName - City name from URL (e.g., "new-york")
 * @param {string[]} allTimezones - Array of all valid timezones
 * @returns {string|null} Full timezone string or null if not found
 */
export function cityNameToTimezone(cityName, allTimezones) {
  if (!cityName || !allTimezones) return null;
  
  // Convert hyphens back to underscores for matching
  const normalizedCityName = cityName.toLowerCase().replace(/-/g, "_");
  
  // Find matching timezone
  // Try exact match first
  for (const tz of allTimezones) {
    const tzCity = tz.split("/").pop().toLowerCase();
    if (tzCity === normalizedCityName) {
      return tz;
    }
  }
  
  return null;
}

