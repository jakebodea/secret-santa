interface SecretSantaAssignmentProps {
  giverName: string
  receiverName: string
}

export default function SecretSantaAssignment({
  giverName,
  receiverName,
}: SecretSantaAssignmentProps) {
  return (
    <html>
      <head>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');
        `}</style>
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: '#faf9f7',
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
        }}
      >
        <table
          width="100%"
          cellPadding="0"
          cellSpacing="0"
          style={{ backgroundColor: '#faf9f7' }}
        >
          <tr>
            <td align="center" style={{ padding: '40px 20px' }}>
              <table
                width="600"
                cellPadding="0"
                cellSpacing="0"
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                }}
              >
                {/* Header with gifts */}
                <tr>
                  <td align="center" style={{ padding: '40px 40px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                      <span style={{ fontSize: '48px' }}>🎁</span>
                      <h1
                        style={{
                          margin: 0,
                          fontSize: '36px',
                          fontFamily: "'Instrument Serif', Georgia, serif",
                          color: '#331a0d',
                          fontWeight: 'normal',
                        }}
                      >
                        Your Secret Santa Assignment
                      </h1>
                      <span style={{ fontSize: '48px' }}>🎁</span>
                    </div>
                  </td>
                </tr>

                {/* Greeting */}
                <tr>
                  <td align="center" style={{ padding: '20px 40px' }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '20px',
                        color: '#806656',
                        lineHeight: '1.6',
                      }}
                    >
                      Ho ho ho, {giverName}! 🎅
                    </p>
                  </td>
                </tr>

                {/* Main content */}
                <tr>
                  <td align="center" style={{ padding: '20px 40px' }}>
                    <p
                      style={{
                        margin: '0 0 30px',
                        fontSize: '18px',
                        color: '#806656',
                        lineHeight: '1.6',
                      }}
                    >
                      The Secret Santa assignments have been revealed! You've been matched with...
                    </p>
                  </td>
                </tr>

                {/* Receiver reveal box */}
                <tr>
                  <td align="center" style={{ padding: '0 40px 30px' }}>
                    <div
                      style={{
                        backgroundColor: '#f5f0e8',
                        border: '2px solid #c9985a',
                        borderRadius: '8px',
                        padding: '30px',
                      }}
                    >
                      <p
                        style={{
                          margin: '0 0 10px',
                          fontSize: '16px',
                          color: '#806656',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                        }}
                      >
                        You're giving a gift to
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '32px',
                          fontFamily: "'Instrument Serif', Georgia, serif",
                          color: '#8c3e2b',
                          fontWeight: 'normal',
                        }}
                      >
                        {receiverName}
                      </p>
                    </div>
                  </td>
                </tr>

                {/* Reminder */}
                <tr>
                  <td align="center" style={{ padding: '0 40px 30px' }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '16px',
                        color: '#806656',
                        lineHeight: '1.6',
                      }}
                    >
                      Remember, this is a secret! 🤫 Don't let them know you're their Secret Santa until the big reveal!
                    </p>
                  </td>
                </tr>

                {/* Footer */}
                <tr>
                  <td
                    align="center"
                    style={{
                      padding: '30px 40px 40px',
                      borderTop: '1px solid #e5ddd0',
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: '14px',
                        color: '#806656',
                      }}
                    >
                      Happy gift giving! 🎄✨
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  )
}

