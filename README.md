# DTR Generator for Maclang Hospital

A modern, dynamic web application designed to encode Daily Time Records (DTR) and generate perfectly formatted Excel reports matching the **Civil Service Form No. 48** standard. Built specifically for the needs of Maclang Hospital.

## ✨ Key Features

- **Dynamic Attendance Encoding:** An intuitive and modern interface for inputting daily time-in and time-out data, complete with real-time form validation and visual error states.
- **Automated Excel Export:** Instantly generate DTR records in an Excel format that mirrors Civil Service Form No. 48. The export utilizes a professional gray/white background theme with strict legal paper sizing and specific cell borders.
- **Intelligent Day Types:** Seamlessly assign "Work", "Off", or "Holiday" statuses per day. The application and Excel generator recognize these statuses and format the cells appropriately (e.g., printing "Holiday" correctly in the time entry section).
- **Fast Data Entry:** Includes a quick "Copy previous day's inputs" function for faster and more efficient encoding.
- **Premium User Experience:** Features interactive date and time pickers, sticky floating action buttons, clear confirmation dialogs, and a dynamic footer reflecting the selected period.
- **Dark/Light Mode:** Includes an integrated theme toggle with local storage persistence for comfortable viewing in any environment.
- **Cross-Browser Compatibility:** Carefully optimized for consistent rendering across Google Chrome, Brave, and Mozilla Firefox browsers.

## 🛠️ Technologies Used

- **Framework & Language:** React 19, TypeScript, Vite
- **Styling & Components:** Tailwind CSS v4, Shadcn UI, Radix UI
- **Icons:** Lucide React, Hugeicons
- **Forms & State Management:** React Hook Form
- **Date Handling:** `date-fns`, `react-day-picker`
- **Excel Generation:** ExcelJS
- **Toast Notifications:** Sonner
- **Theming:** `next-themes`

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository and navigate into the project directory:
   ```bash
   cd dtr-generator-for-maclang
   ```

2. Install the necessary dependencies:
   ```bash
   npm install
   ```

### Running Locally

Start the Vite development server with Hot Module Replacement (HMR):
```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173`.

### Building for Production

To create an optimized production build:
```bash
npm run build
```
You can preview the built application locally using:
```bash
npm run preview
```

## 📄 Form Details

This application automatically handles the strict requirements of the Civil Service form, ensuring consistent uppercase formatting for time entries, adhering to character limits, and aligning to the required document structure out of the box.

---

*This project was developed to modernize the DTR encoding operations and improve the workflow for Maclang Hospital's human resources and staff.*
