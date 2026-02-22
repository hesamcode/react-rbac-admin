export const formatDateTime = (isoValue) => {
  if (!isoValue) {
    return '-'
  }

  const date = new Date(isoValue)
  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export const daysAgoLabel = (isoValue) => {
  const date = new Date(isoValue)
  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  const diffMs = Date.now() - date.getTime()
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000))

  if (diffDays <= 0) {
    return 'Today'
  }

  if (diffDays === 1) {
    return '1 day ago'
  }

  return `${diffDays} days ago`
}
