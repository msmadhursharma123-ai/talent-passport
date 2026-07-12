import React from "react";

interface TablePaginationProps {

  page: number;

  totalPages: number;

  onPrevious: () => void;

  onNext: () => void;

}

export default function TablePagination({

  page,

  totalPages,

  onPrevious,

  onNext,

}: TablePaginationProps) {

  return (

    <div style={containerStyle}>

      <button

        onClick={onPrevious}

        disabled={page <= 1}

      >

        Previous

      </button>

      <span>

        {page} / {totalPages}

      </span>

      <button

        onClick={onNext}

        disabled={page >= totalPages}

      >

        Next

      </button>

    </div>

  );

}

const containerStyle: React.CSSProperties = {

  display: "flex",

  justifyContent: "flex-end",

  gap: 16,

  paddingTop: 20,

};