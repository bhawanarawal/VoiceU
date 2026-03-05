import { useState, useEffect} from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Link } from "react-router";
import api from "../../utils/api";

interface Notification{
  notification_id:number;
  message:string;
  category:string;
  is_read:boolean;
  created_at:string;
  photo_url:string | null;
}
export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notification, setNotification] = useState<Notification[]>([]);


  const fetchNotification = async ()=>{
    try{
      const res = await api.get("notifications/")
      setNotification(res.data);

    }catch(error:any){
      console.error("Failed to fetch notifications:", error);
    }
  }

  useEffect (()=>{
    fetchNotification();
    const interval = setInterval(fetchNotification, 30000)//check every 30 seconds
     return () => clearInterval(interval);
  },[])

  const handleToggle = async () =>{
    const nextState =!isOpen;

    setIsOpen(nextState);

    if(nextState && notification.some((n)=> !n.is_read)){
      setNotification((prev)=>
      prev.map((n)=>({...n, is_read:true})));

      const unreadIds = notification
      .filter((n)=>!n.is_read)
      .map((n)=> n.notification_id);

      Promise.all(
        unreadIds.map((id)=>
        api.post(`notifications/${id}/read`).catch((err)=>
        console.error(`failed to mark${id} as read:`,err)))
      )


     

    }
  }

  const hasUnread = notification.some((n)=>!n.is_read);

  const renderNotificationImage= (notif:Notification)=>{
    if(notif.category=="candidate_application" && notif.photo_url){
      return(
       <img
        src={`http://localhost:8000${notif.photo_url}`}
        alt="Candidate"
        className="h-full w-full rounded-full object-cover border border-gray-200"
      />
      )

    }
  const nameMatch = notif.message.match(/:(.*)/);
  const name = nameMatch ? nameMatch[1].trim() : "U";
  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

     return (
    <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-[10px] font-bold text-white uppercase">
      {initials}
    </div>
  );
};
 

  

 

  // function toggleDropdown() {
  //   setIsOpen(!isOpen);
  // }

  // function closeDropdown() {
  //   setIsOpen(false);
  // }

  // const handleClick = () => {
  //   toggleDropdown();
  //   setNotifying(false);
  // };
  return (
    <div className="relative">
      <button
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900"
        onClick={handleToggle}
      >
        {/* Dynamic Orange Dot */}
        {hasUnread && (
          <span className="absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-orange-400 flex">
            <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
          </span>
        )}
        <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20">
          <path d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z" fill="currentColor"/>
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark lg:right-0"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Notifications ({notification.length})
          </h5>
        </div>
        
        <ul className="flex flex-col h-auto overflow-y-auto custom-scrollbar">
    {notification.length === 0 ? (
      <li className="p-4 text-center text-gray-500">No new alerts</li>
    ) : (
      notification.map((notif) => (
        <li key={notif.notification_id}>
          <DropdownItem className="flex gap-3 rounded-lg border-b border-gray-100 p-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5">
            <span className="relative block h-10 w-10 shrink-0">
              {/* --- CALL THE RENDER FUNCTION HERE --- */}
              {renderNotificationImage(notif)}
              
              <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white ${
                notif.category === "candidate_application" ? "bg-blue-500" : "bg-success-500"
              }`}></span>
            </span>
            
            <span className="block">
              <span className={`mb-1.5 block text-theme-sm ${notif.is_read ? 'text-gray-500' : 'font-medium text-gray-800 dark:text-white/90'}`}>
                {notif.message}
              </span>
              {/* ... category and time ... */}
            </span>
          </DropdownItem>
        </li>
      ))
    )}
  </ul>
      </Dropdown>
    </div>
  );
}
