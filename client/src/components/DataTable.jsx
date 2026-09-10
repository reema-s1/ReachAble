// APG "sortable table" pattern: <th scope="col">, aria-sort, caption.
export default function DataTable({ caption, columns, rows, sortBy, sortDir, onSort, renderRow }) {
  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <caption>{caption}</caption>
        <thead>
          <tr>
            {columns.map((col) => {
              if (!col.sortable) {
                return (
                  <th key={col.key} scope="col">
                    {col.label}
                  </th>
                );
              }
              const isSorted = sortBy === col.key;
              const ariaSort = isSorted ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none';
              return (
                <th key={col.key} scope="col" aria-sort={ariaSort}>
                  <button
                    type="button"
                    className="sort-button"
                    onClick={() => onSort(col.key)}
                  >
                    {col.label}
                    <span aria-hidden="true">{isSorted ? (sortDir === 'asc' ? '▲' : '▼') : ''}</span>
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>{rows.map((row) => renderRow(row))}</tbody>
      </table>
    </div>
  );
}
