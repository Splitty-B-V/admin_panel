export const downloadBlob = (blob: Blob, filename: string): void => {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename

    document.body.appendChild(link)
    link.click()

    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
}

export const generateReportFilename = (dateFilter: string): string => {
    const timestamp = new Date().toISOString().split('T')[0]
    return `splitty-report-${dateFilter}-${timestamp}.pdf`
}