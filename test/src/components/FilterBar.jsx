import { memo } from 'react'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

// FilterBar provides a reusable dropdown filter for notification types.
function FilterBar({ selectedFilter, onFilterChange }) {
  return (
    <Box className="filter-bar" component="section" aria-label="Notification filter">
      <FormControl className="filter-control" fullWidth>
        <InputLabel id="notification-filter-label">Filter notifications</InputLabel>
        <Select
          labelId="notification-filter-label"
          id="notification-filter"
          value={selectedFilter}
          label="Filter notifications"
          onChange={onFilterChange}
          inputProps={{ 'aria-label': 'Notification filter' }}
        >
          <MenuItem value="All">All</MenuItem>
          <MenuItem value="Placement">Placement</MenuItem>
          <MenuItem value="Result">Result</MenuItem>
          <MenuItem value="Event">Event</MenuItem>
        </Select>
      </FormControl>
    </Box>
  )
}

export default memo(FilterBar)
