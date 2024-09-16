import React, { useState } from "react";
import jp from "/assets/svgs/jp.svg";
import kr from "/assets/svgs/kr.svg";
import us from "/assets/svgs/us.svg";

type FlagOption = {
  label: string;
  iconUrl: string;
};

const flagOptions: FlagOption[] = [
  { label: "KR", iconUrl: kr },
  { label: "US", iconUrl: us },
  { label: "JP", iconUrl: jp },
];

const DropdownMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<FlagOption>(flagOptions[0]);

  const handleOptionClick = (option: FlagOption) => {
    setSelectedOption(option);
    setIsOpen(false); // 옵션 선택 후 드롭다운을 닫습니다.
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative font-work">
      <div className="flex items-center justify-between h-9 w-32 border border-gray-300 rounded-md px-3 py-2 cursor-pointer" onClick={toggleDropdown}>
        <div className="flex items-center gap-3 text-sm">
          <img src={selectedOption.iconUrl} alt={selectedOption.label} className="w-6 h-6 mr-2" />
          <span>{selectedOption.label}</span>
        </div>

        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-500 transform ${isOpen ? "rotate-180" : "rotate-0"} transition-all`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M6.293 7.293a1 1 0 011.414 0L10 9.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>
      {isOpen && (
        <div className="absolute z-10 mt-2 w-32 bg-white border border-gray-300 rounded-md shadow-lg">
          {flagOptions.map((option, index) => (
            <div key={index} className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100" onClick={() => handleOptionClick(option)}>
              <img src={option.iconUrl} alt={option.label} className="w-6 h-6 mr-2" />
              <span>{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
