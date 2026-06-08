import React from "react";

interface FloatingMessageProps {
  message: string;
}

const FloatingMessage = ({ message }: FloatingMessageProps) => {
  return (
    <div className="fixed bottom-4 right-4 bg-zinc-800 text-zinc-100 px-4 py-2 rounded-lg shadow-lg">
      {message}
    </div>
  );
};

export default FloatingMessage;
