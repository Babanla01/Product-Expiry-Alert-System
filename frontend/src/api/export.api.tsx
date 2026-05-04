import api from './axios'

const downloadFile = (data: string, filename: string, mimeType: string) => {
  const blob = new Blob([data], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export const exportProductsCSV = async (params?: { status?: string; category?: string }) => {
  const res = await api.get('/export/products/csv', { params, responseType: 'text' })
  downloadFile(res.data, 'products.csv', 'text/csv')
}

export const exportProductsPDF = async (params?: { status?: string; category?: string }) => {
  const res = await api.get('/export/products/pdf', { params, responseType: 'text' })
  downloadFile(res.data, 'products-report.html', 'text/html')
}

export const exportAlertsCSV = async () => {
  const res = await api.get('/export/alerts/csv', { responseType: 'text' })
  downloadFile(res.data, 'alerts.csv', 'text/csv')
}