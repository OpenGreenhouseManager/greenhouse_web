export const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    resizeDelay: 0, // Immediate resize
    devicePixelRatio: 1, // Prevent high DPI scaling issues
    plugins: {
      legend: {
        display: false,
        position: 'top' as const,
        labels: {
          boxWidth: 12,
          padding: 10,
          font: {
            size: 10 // Smaller font for tight spaces
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        ticks: {
          font: {
            size: 8
          },
          maxTicksLimit: 5 // Limit ticks for small spaces
        }
      },
      y: {
        display: true,
        ticks: {
          font: {
            size: 8
          },
          maxTicksLimit: 5 // Limit ticks for small spaces
        }
      }
    },
    elements: {
      point: {
        radius: 2, // Smaller points for tight spaces
        hoverRadius: 4
      },
      line: {
        borderWidth: 1 // Thinner lines for small charts
      }
    }
  };