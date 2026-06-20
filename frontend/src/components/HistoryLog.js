import React, { useState } from 'react';

function HistoryLog() {
  const [entries] = useState([]);

  return (
    <div className="history-section">
      {entries.length === 0 ? (
        <div className="empty-state">
          <p>No historical predictions yet.</p>
          <p className="hint">Predictions stored on 0G Storage will appear here with their verification hashes and links to the storage audit trail.</p>
        </div>
      ) : (
        <div className="history-list">
          {entries.map((entry, i) => (
            <div key={i} className="history-entry">
              <span>Not implemented yet</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export { HistoryLog };
