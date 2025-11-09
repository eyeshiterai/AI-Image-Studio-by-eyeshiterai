import React from 'react';

type ActiveTab = 'generate' | 'edit';

interface TabsProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab }) => {
  // FIX: Replaced JSX.Element with React.ReactElement to resolve namespace error.
  const tabs: { id: ActiveTab; label: string; icon: React.ReactElement }[] = [
    { id: 'generate', label: 'Generate', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/><path d="M12 22v-5"/><path d="M9 17h6"/></svg> },
    { id: 'edit', label: 'Edit', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg> },
  ];

  return (
    <div className="flex justify-center space-x-2 bg-gray-800 p-2 rounded-full max-w-sm mx-auto shadow-inner">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`
            w-full flex justify-center items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-300
            ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow'
                : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
            }
          `}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default Tabs;