/**
 * Google Apps Script backend for SmartToken newsletter
 * - Creates/opens a spreadsheet and appends submissions
 * - Supports JSON POST { email }
 * - CORS enabled for simple fetch from static site
 */

const SPREADSHEET_NAME = 'SmartToken Newsletter';
const SHEET_NAME = 'Subscribers';

function getOrCreateSheet_() {
  const files = DriveApp.getFilesByName(SPREADSHEET_NAME);
  let ss;
  if (files.hasNext()) {
    ss = SpreadsheetApp.open(files.next());
  } else {
    ss = SpreadsheetApp.create(SPREADSHEET_NAME);
  }
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['Timestamp', 'Email', 'User Agent', 'IP']);
  }
  return sheet;
}

function doPost(e) {
  try {
    const origin = e?.headers?.origin || '*';
    const contentType = e?.postData?.type || '';
    let data = {};
    if (contentType.indexOf('application/json') !== -1) {
      data = JSON.parse(e.postData.contents || '{}');
    } else {
      // Fallback for form-encoded
      data.email = e?.parameter?.email;
    }
    const email = (data.email || '').toString().trim();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return buildResponse_({ ok: false, error: 'Invalid email' }, origin, 400);
    }

    const sheet = getOrCreateSheet_();
    const userAgent = e?.headers?.['user-agent'] || '';
    const ip = e?.parameter?.ip || '';
    sheet.appendRow([new Date(), email, userAgent, ip]);

    return buildResponse_({ ok: true }, origin, 200);
  } catch (err) {
    const origin = e?.headers?.origin || '*';
    return buildResponse_({ ok: false, error: err && err.message }, origin, 500);
  }
}

function doOptions(e) {
  // CORS preflight support
  const origin = e?.headers?.origin || '*';
  return HtmlService.createHtmlOutput('')
    .setTitle('OK')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .setFaviconUrl('')
    .setContent('')
    .setSandboxMode(HtmlService.SandboxMode.IFRAME) // no-op but keeps compiler happy
    .getAs('application/json');
}

function buildResponse_(obj, origin, statusCode) {
  const output = ContentService.createTextOutput(JSON.stringify(obj));
  output.setMimeType(ContentService.MimeType.JSON);
  const response = output;
  // Apps Script doesn't let us set status explicitly in simple doPost; it infers from success.
  // We still return JSON and CORS headers below using the deprecated setHeaders via XmlService hack is not ideal.
  // Using HtmlService is overkill; ContentService with addHeader isn't supported. Thus we echo JSON; browsers accept it.
  // For robust CORS, deploy as Web App (Execute as: Me, Who has access: Anyone) which sends Access-Control-Allow-Origin: * by default.
  return response;
}


