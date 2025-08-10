interface PaginationProps {
  page: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ page, total, pageSize, onPageChange }: PaginationProps) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 1;
  const canNext = page < totalPages;
  return (
    <div className="flex items-center justify-between gap-2 mt-4">
      <button
        className="px-3 py-1 rounded border disabled:opacity-50"
        onClick={() => onPageChange(1)}
        disabled={!canPrev}
      >
        First
      </button>
      <button
        className="px-3 py-1 rounded border disabled:opacity-50"
        onClick={() => onPageChange(page - 1)}
        disabled={!canPrev}
      >
        Prev
      </button>
      <span className="text-sm text-gray-600">
        Page {page} of {totalPages}
      </span>
      <button
        className="px-3 py-1 rounded border disabled:opacity-50"
        onClick={() => onPageChange(page + 1)}
        disabled={!canNext}
      >
        Next
      </button>
      <button
        className="px-3 py-1 rounded border disabled:opacity-50"
        onClick={() => onPageChange(totalPages)}
        disabled={!canNext}
      >
        Last
      </button>
    </div>
  );
};

export default Pagination;
