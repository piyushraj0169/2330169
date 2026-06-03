import { memo, useCallback } from 'react'
import Box from '@mui/material/Box'
import Pagination from '@mui/material/Pagination'
import Typography from '@mui/material/Typography'
import { logInfo } from '../utils/logger'

function PaginationControls({ page, count, pageSize = 10, onPageChange }) {
  const pageLabel = count === 0 ? 'No pages available.' : `Showing page ${page} of ${count}`
  const pageSizeLabel = count > 0 ? ` (${pageSize} per page)` : ''

  const handleChange = useCallback(
    (event, value) => {
      void logInfo('component', `Page changed to ${value}`)
      onPageChange(event, value)
    },
    [onPageChange],
  )

  return (
    <Box className="pagination-bar" component="nav" aria-label="Notification pagination">
      <Typography variant="body2" component="p" className="pagination-info">
        {pageLabel}
        {pageSizeLabel}
      </Typography>
      {count > 1 && (
        <Pagination
          page={page}
          count={count}
          onChange={handleChange}
          color="primary"
          shape="rounded"
          siblingCount={1}
          boundaryCount={1}
          showFirstButton
          showLastButton
          className="pagination-widget"
          aria-label="Notification page navigation"
        />
      )}
    </Box>
  )
}

export default memo(PaginationControls)
