// ============================================
// VONTECH CRM - Google Apps Script
// Paste this in Extensions > Apps Script
// ============================================

// CONFIGURATION - Change this to your email
const NOTIFICATION_EMAIL = "manager@vontech.info";
const COMPANY_NAME = "Vontech Solutions";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Leads");

    // If "Leads" sheet doesn't exist, use the first sheet
    const targetSheet = sheet || SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Add row to spreadsheet
    targetSheet.appendRow([
      new Date().toLocaleString("en-US", { timeZone: "America/New_York" }),
      data.name || "",
      data.company || "",
      data.email || "",
      (data.country_code || "") + " " + (data.phone || ""),
      data.product || "",
      data.application || data.interest || "",
      data.message || "",
      data.source_page || "Website",
      "New",  // Status
      "",     // Notes
      ""      // Follow-up date
    ]);

    // Send notification email to Vontech
    sendNotificationEmail(data);

    // Send auto-reply to client
    sendAutoReply(data);

    // Return success
    return ContentService
      .createTextOutput(JSON.stringify({ result: "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function sendNotificationEmail(data) {
  const phone = (data.country_code || "") + " " + (data.phone || "");
  const subject = "New Lead: " + (data.name || "Unknown") + " - " + (data.company || "No company");

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0B3D91; padding: 20px; border-radius: 12px 12px 0 0;">
        <h2 style="color: white; margin: 0;">New Lead Received</h2>
        <p style="color: rgba(255,255,255,0.7); margin: 5px 0 0;">From: ${data.source_page || "vontechsolutions.com"}</p>
      </div>
      <div style="background: #f8f9fa; padding: 24px; border: 1px solid #e0e0e0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 12px; font-weight: bold; color: #555; width: 130px;">Name</td><td style="padding: 8px 12px; color: #222;">${data.name || "-"}</td></tr>
          <tr style="background: white;"><td style="padding: 8px 12px; font-weight: bold; color: #555;">Company</td><td style="padding: 8px 12px; color: #222;">${data.company || "-"}</td></tr>
          <tr><td style="padding: 8px 12px; font-weight: bold; color: #555;">Email</td><td style="padding: 8px 12px;"><a href="mailto:${data.email}" style="color: #0B3D91;">${data.email || "-"}</a></td></tr>
          <tr style="background: white;"><td style="padding: 8px 12px; font-weight: bold; color: #555;">Phone</td><td style="padding: 8px 12px; color: #222;">${phone}</td></tr>
          <tr><td style="padding: 8px 12px; font-weight: bold; color: #555;">Product</td><td style="padding: 8px 12px; color: #222;">${data.product || "-"}</td></tr>
          <tr style="background: white;"><td style="padding: 8px 12px; font-weight: bold; color: #555;">Interest</td><td style="padding: 8px 12px; color: #222;">${data.application || data.interest || "-"}</td></tr>
          <tr><td style="padding: 8px 12px; font-weight: bold; color: #555; vertical-align: top;">Message</td><td style="padding: 8px 12px; color: #222;">${data.message || "-"}</td></tr>
        </table>
      </div>
      <div style="background: #0A1628; padding: 16px 24px; border-radius: 0 0 12px 12px;">
        <p style="color: rgba(255,255,255,0.5); font-size: 12px; margin: 0;">Vontech CRM - Automated notification</p>
      </div>
    </div>
  `;

  MailApp.sendEmail({
    to: NOTIFICATION_EMAIL,
    subject: subject,
    htmlBody: htmlBody,
    replyTo: data.email || NOTIFICATION_EMAIL
  });
}

function sendAutoReply(data) {
  if (!data.email) return;

  const clientName = data.name ? data.name.split(" ")[0] : "there";

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0B3D91; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">VONTECH</h1>
        <p style="color: #00D4FF; margin: 8px 0 0; font-size: 14px;">Water Treatment Technology</p>
      </div>
      <div style="background: white; padding: 32px; border: 1px solid #e8ecf1;">
        <h2 style="color: #0A1628; margin: 0 0 16px;">Hi ${clientName},</h2>
        <p style="color: #555; line-height: 1.7; font-size: 15px;">
          Thank you for your interest in Vontech. We have received your request and a specialist from our team will review your information and contact you within the next <strong>24 hours</strong>.
        </p>
        <p style="color: #555; line-height: 1.7; font-size: 15px;">
          Here is a summary of what you submitted:
        </p>
        <div style="background: #f8f9fa; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 4px 0; color: #333;"><strong>Company:</strong> ${data.company || "-"}</p>
          <p style="margin: 4px 0; color: #333;"><strong>Product of interest:</strong> ${data.product || data.application || "General inquiry"}</p>
          ${data.message ? '<p style="margin: 4px 0; color: #333;"><strong>Message:</strong> ' + data.message + '</p>' : ''}
        </div>
        <p style="color: #555; line-height: 1.7; font-size: 15px;">
          In the meantime, feel free to explore our platform at <a href="https://vontechsolutions.com" style="color: #0B3D91;">vontechsolutions.com</a> or reply to this email with any additional questions.
        </p>
        <p style="color: #555; line-height: 1.7; font-size: 15px; margin-top: 24px;">
          Best regards,<br>
          <strong style="color: #0A1628;">The Vontech Team</strong><br>
          <span style="color: #888; font-size: 13px;">manager@vontech.info</span>
        </p>
      </div>
      <div style="background: #0A1628; padding: 20px; text-align: center; border-radius: 0 0 12px 12px;">
        <p style="color: rgba(255,255,255,0.4); font-size: 12px; margin: 0;">
          Vontech Solutions | Industrial Water Treatment Technology<br>
          <a href="https://vontechsolutions.com" style="color: #00D4FF; font-size: 12px;">vontechsolutions.com</a>
        </p>
      </div>
    </div>
  `;

  MailApp.sendEmail({
    to: data.email,
    subject: "Thank you for contacting Vontech - We received your request",
    htmlBody: htmlBody,
    name: COMPANY_NAME,
    replyTo: NOTIFICATION_EMAIL
  });
}

// Test function - run this to verify the script works
function testScript() {
  const testData = {
    postData: {
      contents: JSON.stringify({
        name: "Test User",
        company: "Test Company",
        email: NOTIFICATION_EMAIL,
        country_code: "+1",
        phone: "555-0000",
        product: "Reverse Osmosis (RO)",
        application: "Guardian HMI Controller",
        message: "This is a test submission",
        source_page: "Test"
      })
    }
  };
  doPost(testData);
  Logger.log("Test completed - check your email and spreadsheet");
}
