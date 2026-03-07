// ============================================
// VONTECH CRM - Google Apps Script
// ============================================

// CONFIGURATION
var NOTIFICATION_EMAIL = "manager@vontech.info";
var COMPANY_NAME = "Vontech Solutions";
var WEBSITE_URL = "https://vontechsolutions.com";
var GUARDIAN_URL = "https://vontechsolutions.com/guardian/";

// ============================================
// 1. RECEIVE NEW LEADS
// ============================================
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Leads");
    var targetSheet = sheet || SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

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
      "New",
      "",
      "",
      "",
      0
    ]);

    sendNotificationEmail(data);
    sendWelcomeEmail(data);

    return ContentService
      .createTextOutput(JSON.stringify({ result: "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================
// 2. NOTIFICATION EMAIL TO VONTECH
// ============================================
function sendNotificationEmail(data) {
  var phone = (data.country_code || "") + " " + (data.phone || "");
  var subject = "New Lead: " + (data.name || "Unknown") + " - " + (data.company || "No company");

  var htmlBody = "<div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto;'>"
    + "<div style='background:#0B3D91;padding:20px;border-radius:12px 12px 0 0;'>"
    + "<h2 style='color:white;margin:0;'>New Lead Received</h2>"
    + "<p style='color:rgba(255,255,255,0.7);margin:5px 0 0;'>From: " + (data.source_page || "vontechsolutions.com") + "</p>"
    + "</div>"
    + "<div style='background:#f8f9fa;padding:24px;border:1px solid #e0e0e0;'>"
    + "<table style='width:100%;border-collapse:collapse;'>"
    + "<tr><td style='padding:8px 12px;font-weight:bold;color:#555;width:130px;'>Name</td><td style='padding:8px 12px;color:#222;'>" + (data.name || "-") + "</td></tr>"
    + "<tr style='background:white;'><td style='padding:8px 12px;font-weight:bold;color:#555;'>Company</td><td style='padding:8px 12px;color:#222;'>" + (data.company || "-") + "</td></tr>"
    + "<tr><td style='padding:8px 12px;font-weight:bold;color:#555;'>Email</td><td style='padding:8px 12px;'><a href='mailto:" + (data.email || "") + "' style='color:#0B3D91;'>" + (data.email || "-") + "</a></td></tr>"
    + "<tr style='background:white;'><td style='padding:8px 12px;font-weight:bold;color:#555;'>Phone</td><td style='padding:8px 12px;color:#222;'>" + phone + "</td></tr>"
    + "<tr><td style='padding:8px 12px;font-weight:bold;color:#555;'>Product</td><td style='padding:8px 12px;color:#222;'>" + (data.product || "-") + "</td></tr>"
    + "<tr style='background:white;'><td style='padding:8px 12px;font-weight:bold;color:#555;'>Interest</td><td style='padding:8px 12px;color:#222;'>" + (data.application || data.interest || "-") + "</td></tr>"
    + "<tr><td style='padding:8px 12px;font-weight:bold;color:#555;vertical-align:top;'>Message</td><td style='padding:8px 12px;color:#222;'>" + (data.message || "-") + "</td></tr>"
    + "</table>"
    + "</div>"
    + "<div style='background:#0A1628;padding:16px 24px;border-radius:0 0 12px 12px;'>"
    + "<p style='color:rgba(255,255,255,0.5);font-size:12px;margin:0;'>Vontech CRM - Automated notification</p>"
    + "</div>"
    + "</div>";

  MailApp.sendEmail({
    to: NOTIFICATION_EMAIL,
    subject: subject,
    htmlBody: htmlBody,
    replyTo: data.email || NOTIFICATION_EMAIL
  });
}

// ============================================
// 3. WELCOME AUTO-REPLY (sent immediately)
// ============================================
function sendWelcomeEmail(data) {
  if (!data.email) return;

  var clientName = data.name ? data.name.split(" ")[0] : "there";

  var htmlBody = "<div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f5f7fa;'>"
    // Header
    + "<div style='background:#0B3D91;padding:30px;text-align:center;border-radius:12px 12px 0 0;'>"
    + "<h1 style='color:white;margin:0;font-size:26px;letter-spacing:2px;'>VONTECH</h1>"
    + "<p style='color:#00D4FF;margin:8px 0 0;font-size:13px;letter-spacing:1px;'>WATER TREATMENT TECHNOLOGY</p>"
    + "</div>"
    // Welcome
    + "<div style='background:white;padding:32px;border-left:1px solid #e8ecf1;border-right:1px solid #e8ecf1;'>"
    + "<h2 style='color:#0A1628;margin:0 0 16px;font-size:22px;'>Hi " + clientName + ",</h2>"
    + "<p style='color:#555;line-height:1.7;font-size:15px;'>"
    + "Thank you for your interest in Vontech! We have received your request and a specialist from our team will contact you within the next <strong>24 hours</strong>."
    + "</p>"
    // Summary box
    + "<div style='background:#f0f4f8;border-radius:10px;padding:20px;margin:20px 0;border-left:4px solid #0B3D91;'>"
    + "<h3 style='color:#0A1628;margin:0 0 10px;font-size:14px;'>YOUR REQUEST SUMMARY</h3>"
    + "<p style='margin:4px 0;color:#333;font-size:14px;'><strong>Company:</strong> " + (data.company || "-") + "</p>"
    + "<p style='margin:4px 0;color:#333;font-size:14px;'><strong>Product:</strong> " + (data.product || "General inquiry") + "</p>"
    + "<p style='margin:4px 0;color:#333;font-size:14px;'><strong>Interest:</strong> " + (data.application || data.interest || "General inquiry") + "</p>"
    + (data.message ? "<p style='margin:4px 0;color:#333;font-size:14px;'><strong>Message:</strong> " + data.message + "</p>" : "")
    + "</div>"
    + "</div>"
    // What we offer
    + "<div style='background:white;padding:0 32px 32px;border-left:1px solid #e8ecf1;border-right:1px solid #e8ecf1;'>"
    + "<h3 style='color:#0B3D91;margin:0 0 16px;font-size:16px;'>WHAT VONTECH CAN DO FOR YOU</h3>"
    // Product cards
    + "<table style='width:100%;border-collapse:collapse;'>"
    + "<tr>"
    + "<td style='padding:8px;width:50%;vertical-align:top;'>"
    + "<div style='background:#f0f4f8;border-radius:10px;padding:16px;height:100%;'>"
    + "<h4 style='color:#0B3D91;margin:0 0 6px;font-size:14px;'>Guardian HMI</h4>"
    + "<p style='color:#666;font-size:12px;line-height:1.5;margin:0;'>Industrial touchscreen controller (13-32\") with P&ID diagrams, valve control, alarm management, and automated process sequences.</p>"
    + "</div>"
    + "</td>"
    + "<td style='padding:8px;width:50%;vertical-align:top;'>"
    + "<div style='background:#f0f4f8;border-radius:10px;padding:16px;height:100%;'>"
    + "<h4 style='color:#0B3D91;margin:0 0 6px;font-size:14px;'>Web Portal</h4>"
    + "<p style='color:#666;font-size:12px;line-height:1.5;margin:0;'>Cloud dashboard for distributors: manage clients, machines, technicians, maintenance and monitor your entire fleet remotely.</p>"
    + "</div>"
    + "</td>"
    + "</tr>"
    + "<tr>"
    + "<td style='padding:8px;width:50%;vertical-align:top;'>"
    + "<div style='background:#f0f4f8;border-radius:10px;padding:16px;height:100%;'>"
    + "<h4 style='color:#0B3D91;margin:0 0 6px;font-size:14px;'>Mobile App</h4>"
    + "<p style='color:#666;font-size:12px;line-height:1.5;margin:0;'>End-client app for real-time water quality monitoring, technician tracking, service history and direct communication.</p>"
    + "</div>"
    + "</td>"
    + "<td style='padding:8px;width:50%;vertical-align:top;'>"
    + "<div style='background:#f0f4f8;border-radius:10px;padding:16px;height:100%;'>"
    + "<h4 style='color:#0B3D91;margin:0 0 6px;font-size:14px;'>Water Treatment Equipment</h4>"
    + "<p style='color:#666;font-size:12px;line-height:1.5;margin:0;'>RO systems, ultrafiltration, softeners, media filters, filling machines and complete treatment plants for industrial and residential use.</p>"
    + "</div>"
    + "</td>"
    + "</tr>"
    + "</table>"
    // CTA button
    + "<div style='text-align:center;margin:24px 0 8px;'>"
    + "<a href='" + GUARDIAN_URL + "' style='display:inline-block;background:#0B3D91;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;'>Explore Guardian HMI Platform</a>"
    + "</div>"
    + "</div>"
    // Contact info
    + "<div style='background:#f0f4f8;padding:24px 32px;border-left:1px solid #e8ecf1;border-right:1px solid #e8ecf1;'>"
    + "<h3 style='color:#0A1628;margin:0 0 12px;font-size:14px;'>NEED IMMEDIATE ASSISTANCE?</h3>"
    + "<p style='color:#555;font-size:13px;line-height:1.6;margin:0;'>"
    + "Reply directly to this email or contact us at <a href='mailto:manager@vontech.info' style='color:#0B3D91;'>manager@vontech.info</a>"
    + "<br>Visit our website: <a href='" + WEBSITE_URL + "' style='color:#0B3D91;'>vontechsolutions.com</a>"
    + "</p>"
    + "</div>"
    // Signature
    + "<div style='background:white;padding:24px 32px;border-left:1px solid #e8ecf1;border-right:1px solid #e8ecf1;'>"
    + "<p style='color:#555;font-size:14px;line-height:1.6;margin:0;'>"
    + "Best regards,<br>"
    + "<strong style='color:#0A1628;'>The Vontech Team</strong>"
    + "</p>"
    + "</div>"
    // Footer
    + "<div style='background:#0A1628;padding:20px;text-align:center;border-radius:0 0 12px 12px;'>"
    + "<p style='color:rgba(255,255,255,0.4);font-size:11px;margin:0;'>"
    + "Vontech Solutions | Industrial Water Treatment Technology<br>"
    + "<a href='" + WEBSITE_URL + "' style='color:#00D4FF;font-size:11px;'>vontechsolutions.com</a>"
    + "<br><br><span style='font-size:10px;'>You received this email because you submitted a request on our website.</span>"
    + "</p>"
    + "</div>"
    + "</div>";

  MailApp.sendEmail({
    to: data.email,
    subject: "Welcome to Vontech - We received your request",
    htmlBody: htmlBody,
    name: COMPANY_NAME,
    replyTo: NOTIFICATION_EMAIL
  });
}

// ============================================
// 4. MONTHLY FOLLOW-UP (runs automatically)
// ============================================
function sendMonthlyFollowUps() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Leads");
  var targetSheet = sheet || SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = targetSheet.getDataRange().getValues();
  var today = new Date();
  var sentCount = 0;

  // Skip header row (i=0)
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var email = row[3];
    var name = row[1];
    var company = row[2];
    var product = row[5];
    var status = row[9];
    var followUpCount = row[13] || 0;

    // Only send to active leads (not Won, Lost, or Unsubscribed)
    var skipStatuses = ["Won", "Lost", "Closed", "Unsubscribed", "won", "lost", "closed", "unsubscribed"];
    if (!email || skipStatuses.indexOf(status) !== -1) continue;

    // Max 6 follow-ups (6 months)
    if (followUpCount >= 6) continue;

    var clientName = name ? name.split(" ")[0] : "there";
    var newCount = followUpCount + 1;

    // Select template based on follow-up number
    var subject = "";
    var personalMessage = "";

    if (newCount === 1) {
      subject = "Following up on your water treatment inquiry - Vontech";
      personalMessage = "We wanted to follow up on your recent inquiry about our water treatment solutions. Our team is ready to help you find the perfect solution for your needs."
        + "<br><br>If you have any questions or would like to schedule a demo of our Guardian HMI platform, simply reply to this email.";
    } else if (newCount === 2) {
      subject = "New features and updates from Vontech";
      personalMessage = "We have been working on exciting improvements to our Guardian HMI platform and wanted to share them with you:"
        + "<br><br><strong>Latest updates:</strong>"
        + "<br>- Enhanced real-time monitoring with customizable sensor dashboards"
        + "<br>- Improved Machine Editor with drag-and-drop process design"
        + "<br>- Mobile app updates with push notifications for water quality alerts"
        + "<br>- New automated reporting features for compliance tracking"
        + "<br><br>Would you like a personalized demo to see these in action?";
    } else if (newCount === 3) {
      subject = "How Vontech can reduce your operational costs";
      personalMessage = "Many water treatment operators face challenges with manual monitoring, unplanned downtime, and inefficient maintenance schedules."
        + "<br><br><strong>With Vontech, our clients typically experience:</strong>"
        + "<br>- Reduced on-site visits through remote monitoring"
        + "<br>- Fewer equipment failures with automated alerts and preventive maintenance"
        + "<br>- Better water quality consistency with real-time sensor tracking"
        + "<br>- Simplified fleet management with the centralized web portal"
        + "<br><br>We would love to show you how this applies to your specific operation.";
    } else if (newCount === 4) {
      subject = "A quick question about your water treatment needs - Vontech";
      personalMessage = "We understand that choosing the right technology partner is an important decision. We are here whenever you are ready."
        + "<br><br>Is there anything specific holding you back? Whether it is technical questions, pricing, or integration concerns, we are happy to address them."
        + "<br><br>A quick 15-minute call could help clarify everything. Just reply to this email and we will set it up.";
    } else if (newCount === 5) {
      subject = "Special offer for water treatment professionals - Vontech";
      personalMessage = "As a valued contact, we wanted to offer you a complimentary technical consultation for your water treatment operation."
        + "<br><br><strong>What is included:</strong>"
        + "<br>- Assessment of your current monitoring and control setup"
        + "<br>- Recommendations for automation and efficiency improvements"
        + "<br>- Live demo of Guardian HMI customized to your process type"
        + "<br>- No obligation estimate"
        + "<br><br>Interested? Simply reply to this email and we will schedule it at your convenience.";
    } else {
      subject = "Staying in touch - Vontech Water Treatment Solutions";
      personalMessage = "We hope your water treatment operations are running smoothly. We are still here if you ever need automation, monitoring, or control solutions."
        + "<br><br>Feel free to reach out anytime. This will be our last scheduled follow-up, but our door is always open."
        + "<br><br>Wishing you success in your operations.";
    }

    sendFollowUpEmail(email, clientName, company, product, subject, personalMessage, newCount);

    // Update the sheet: Last Follow-up (col M = 13) and Count (col N = 14)
    targetSheet.getRange(i + 1, 13).setValue(today.toLocaleString("en-US", { timeZone: "America/New_York" }));
    targetSheet.getRange(i + 1, 14).setValue(newCount);
    sentCount++;
  }

  Logger.log("Monthly follow-up completed. Emails sent: " + sentCount);
}

function sendFollowUpEmail(email, clientName, company, product, subject, personalMessage, followUpNumber) {
  var htmlBody = "<div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f5f7fa;'>"
    // Header
    + "<div style='background:#0B3D91;padding:30px;text-align:center;border-radius:12px 12px 0 0;'>"
    + "<h1 style='color:white;margin:0;font-size:26px;letter-spacing:2px;'>VONTECH</h1>"
    + "<p style='color:#00D4FF;margin:8px 0 0;font-size:13px;letter-spacing:1px;'>WATER TREATMENT TECHNOLOGY</p>"
    + "</div>"
    // Body
    + "<div style='background:white;padding:32px;border-left:1px solid #e8ecf1;border-right:1px solid #e8ecf1;'>"
    + "<h2 style='color:#0A1628;margin:0 0 16px;font-size:20px;'>Hi " + clientName + ",</h2>"
    + "<p style='color:#555;line-height:1.8;font-size:15px;'>" + personalMessage + "</p>"
    // CTA
    + "<div style='text-align:center;margin:28px 0;'>"
    + "<a href='" + GUARDIAN_URL + "' style='display:inline-block;background:#0B3D91;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;'>Explore Guardian HMI</a>"
    + "<span style='display:block;margin-top:8px;'>"
    + "<a href='" + WEBSITE_URL + "' style='color:#0B3D91;font-size:13px;text-decoration:none;'>Visit vontechsolutions.com</a>"
    + "</span>"
    + "</div>"
    + "</div>"
    // Contact
    + "<div style='background:#f0f4f8;padding:20px 32px;border-left:1px solid #e8ecf1;border-right:1px solid #e8ecf1;'>"
    + "<p style='color:#555;font-size:13px;line-height:1.6;margin:0;'>"
    + "Questions? Reply to this email or contact us at <a href='mailto:manager@vontech.info' style='color:#0B3D91;'>manager@vontech.info</a>"
    + "</p>"
    + "</div>"
    // Signature
    + "<div style='background:white;padding:20px 32px;border-left:1px solid #e8ecf1;border-right:1px solid #e8ecf1;'>"
    + "<p style='color:#555;font-size:14px;margin:0;'>Best regards,<br><strong style='color:#0A1628;'>The Vontech Team</strong></p>"
    + "</div>"
    // Footer
    + "<div style='background:#0A1628;padding:20px;text-align:center;border-radius:0 0 12px 12px;'>"
    + "<p style='color:rgba(255,255,255,0.4);font-size:11px;margin:0;'>"
    + "Vontech Solutions | Industrial Water Treatment Technology<br>"
    + "<a href='" + WEBSITE_URL + "' style='color:#00D4FF;font-size:11px;'>vontechsolutions.com</a>"
    + "<br><br><span style='font-size:10px;'>To stop receiving these emails, reply with UNSUBSCRIBE.</span>"
    + "</p>"
    + "</div>"
    + "</div>";

  MailApp.sendEmail({
    to: email,
    subject: subject,
    htmlBody: htmlBody,
    name: COMPANY_NAME,
    replyTo: NOTIFICATION_EMAIL
  });
}

// ============================================
// 5. SETUP MONTHLY TRIGGER (run once)
// ============================================
function setupMonthlyTrigger() {
  // Remove old triggers first
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "sendMonthlyFollowUps") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  // Create new monthly trigger - runs on the 1st of each month at 9 AM
  ScriptApp.newTrigger("sendMonthlyFollowUps")
    .timeBased()
    .onMonthDay(1)
    .atHour(9)
    .create();

  Logger.log("Monthly trigger created. Follow-ups will be sent on the 1st of each month at 9 AM.");
}

// ============================================
// 6. TEST FUNCTIONS
// ============================================
function testScript() {
  var testData = {
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

function testFollowUp() {
  sendMonthlyFollowUps();
  Logger.log("Follow-up test completed - check emails sent");
}
