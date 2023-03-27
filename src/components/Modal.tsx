import React from "react";

interface ModalProps {
  isVisible: boolean;
  title: string | undefined;
  offices?: any;
  close: () => void;
  accept?: () => void;
}

const Modal: React.FC<ModalProps> = (props: ModalProps) => {
  if (!props.isVisible) return null;
  return (
    <div
      id="defaultModal"
      tabIndex={-1}
      aria-hidden="true"
      className=" fixed z-50 m-auto flex w-full flex-col items-center justify-center overflow-y-auto overflow-x-hidden p-4 backdrop-blur-sm md:inset-0 md:h-full"
    >
      <div className="relative h-full w-full max-w-2xl md:h-auto">
        <div className="relative rounded-lg bg-gray-700 shadow ">
          <div className="flex items-start justify-between rounded-t border-b border-gray-600 p-4">
            <h3 className="text-xl font-semibold text-white">
              {`Please select an office for Order ${props.title}`}
            </h3>
            <button
              type="button"
              className="ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-600 hover:text-white"
              data-modal-hide="defaultModal"
              onClick={props.close}
            >
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
          </div>
          <div className="space-y-6 p-6">{props.offices}</div>
          <div className="flex items-center space-x-2 rounded-b border-t border-gray-600 p-6 ">
            <button
              data-modal-hide="defaultModal"
              type="button"
              onClick={props.accept}
              className="btn"
            >
              Pick this one!
            </button>
            <button
              data-modal-hide="defaultModal"
              type="button"
              className="btn"
            >
              Not listed here... (Doesnt work yet)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
