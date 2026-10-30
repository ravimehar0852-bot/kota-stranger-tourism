// ===== SITE SETTINGS — yahan apni details bharo =====
window.SITE = {
  name: "Kota Stranger Tourism",
  whatsapp: "91XXXXXXXXXX",            // <-- client ka WhatsApp number (91 ke saath, bina + ya space)
  phone: "+91 XXXXXXXXXX",
  email: "kotastrangertourism@gmail.com",
  address: "A191, Ghatotkach Circle, Kota, Rajasthan 324005",
  hours: "Open 24 hours",
  instagram: "https://instagram.com/kotastrangertourism",
  facebook: "https://facebook.com/kotastrangertourism",
  // Firebase Console > Project settings > Web app se copy karo
  firebase: { apiKey: "YOUR_API_KEY", authDomain: "YOUR_APP.firebaseapp.com", projectId: "YOUR_PROJECT_ID", appId: "YOUR_APP_ID" },
  categories: [
    ["Group Trips","👥"],["Weekend Getaways","🌅"],["Himalayan Treks","🏔️"],["Backpacking Trips","🎒"],
    ["Spiritual Trips","🕉️"],["Adventure Activities","🪂"],["Camping Experiences","⛺"],["Customized Packages","🧭"]
  ],
  // Firebase connect hone se pehle ye demo trips dikhte hain (prices sample hain — admin panel se badlo)
  demo: [
    {id:"manali",title:"Manali Group Trip from Kota",location:"Himachal Pradesh",category:"Group Trips",days:5,nights:4,difficulty:"Easy",price:9999,oldPrice:12999,seats:20,batch:"Coming soon",image:"",overview:"Strangers ke saath Manali ki yaadgar group trip.",highlights:["Solang Valley","Mall Road","Hadimba Temple"],itinerary:[{title:"Day 1: Kota to Manali",details:"Departure and overnight journey."}],inclusions:["Transport","Stay on sharing basis","Trip captain"],exclusions:["Personal expenses","Lunch"],carry:["Valid photo ID","Warm clothes"]},
    {id:"nainital",title:"Nainital Weekend Trip from Kota",location:"Uttarakhand",category:"Weekend Getaways",days:4,nights:3,difficulty:"Easy",price:7999,oldPrice:9999,seats:20,batch:"Coming soon",image:"",overview:"Nainital aur aas-paas ki jagah.",highlights:["Naini Lake","Mall Road"],itinerary:[{title:"Day 1: Kota to Nainital",details:"Departure."}],inclusions:["Transport","Stay"],exclusions:["Meals"],carry:["Valid photo ID"]},
    {id:"ujjain",title:"Ujjain Spiritual Trip from Kota",location:"Madhya Pradesh",category:"Spiritual Trips",days:2,nights:1,difficulty:"Easy",price:2499,oldPrice:2999,seats:20,batch:"Coming soon",image:"",overview:"Mahakal darshan ke saath Ujjain trip.",highlights:["Mahakaleshwar Temple"],itinerary:[{title:"Day 1: Kota to Ujjain",details:"Departure."}],inclusions:["Transport"],exclusions:["Meals"],carry:["Valid photo ID"]},
    {id:"kedarnath",title:"Kedarnath Strangers Group Trip",location:"Uttarakhand",category:"Himalayan Treks",days:7,nights:6,difficulty:"Moderate",price:14999,oldPrice:17999,seats:20,batch:"Coming soon",image:"",overview:"Kedarnath yatra strangers ke saath.",highlights:["Kedarnath Temple"],itinerary:[{title:"Day 1: Departure",details:"Kota se departure."}],inclusions:["Transport","Stay"],exclusions:["Meals"],carry:["Valid photo ID","Trekking shoes"]}
  ]
};
