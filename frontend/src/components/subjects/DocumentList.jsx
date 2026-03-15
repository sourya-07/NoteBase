import React from "react";

export function DocumentList({ documents, onDeleteDocument }) {
  return (
    <div className="flex flex-col gap-3 w-full">
      <h3 className="text-xs uppercase tracking-wider font-bold text-[var(--text-muted)]">
        Indexed documents
      </h3>
      
      {documents.length === 0 ? (
        <div className="text-sm italic text-[var(--text-muted)] py-2 border border-dashed border-[var(--border)] rounded px-4">
          No documents indexed for this subject yet.
        </div>
      ) : (
        <div className="border border-[var(--border)] bg-[var(--surface)] rounded-sm overflow-hidden select-none">
          <ul className="divide-y divide-[var(--border)]">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="flex items-center justify-between px-4 py-2.5 hover:bg-[var(--bg)] transition-colors duration-150"
              >
                <span className="font-mono text-sm text-[var(--text-primary)] truncate pr-4">
                  {doc.name}
                </span>
                <button
                  onClick={() => onDeleteDocument(doc.id)}
                  className="text-lg leading-none font-light text-[var(--text-muted)] hover:text-red-500 cursor-pointer w-6 h-6 flex items-center justify-center rounded-full hover:bg-[var(--border)]"
                  title="Delete Document"
                >
                  &times;
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default DocumentList;
