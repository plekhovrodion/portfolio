/**
 * Google Apps Script для сбора оценок портфолио.
 *
 * ВАЖНО: вставляйте код как есть. НЕ оборачивайте в function myFunction() { }.
 * doGet и doPost должны быть на верхнем уровне файла Code.gs.
 *
 * 1. Создайте Google Таблицу с листом "Ratings".
 * 2. Расширения → Apps Script → удалите myFunction, вставьте этот код.
 * 3. Project Settings → Script properties:
 *    - ADMIN_KEY — секрет для страницы /ratings/
 *    - TELEGRAM_BOT_TOKEN (необязательно)
 *    - TELEGRAM_CHAT_ID (необязательно)
 * 4. Deploy → New deployment → Web app:
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. URL деплоя положите в NEXT_PUBLIC_RATING_API_URL
 * 6. После правок doGet (action=submit) — New version → Deploy
 */

var SHEET_NAME = "Ratings";
var HEADERS = [
  "createdAt",
  "rating",
  "name",
  "visitorId",
  "page",
  "referrer",
  "userAgent",
];

function getSheet_() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
  }

  return sheet;
}

function getAdminKey_() {
  return PropertiesService.getScriptProperties().getProperty("ADMIN_KEY");
}

function jsonResponse_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function notifyTelegram_(message) {
  var token = PropertiesService.getScriptProperties().getProperty(
    "TELEGRAM_BOT_TOKEN",
  );
  var chatId = PropertiesService.getScriptProperties().getProperty(
    "TELEGRAM_CHAT_ID",
  );

  if (!token || !chatId) {
    return;
  }

  UrlFetchApp.fetch(
    "https://api.telegram.org/bot" + token + "/sendMessage",
    {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
      muteHttpExceptions: true,
    },
  );
}

function submitRating_(payload) {
  var rating = Number(payload.rating);

  if (!(rating >= 1 && rating <= 5)) {
    return jsonResponse_({ ok: false, error: "invalid_rating" });
  }

  var sheet = getSheet_();
  var createdAt = new Date().toISOString();
  var name = String(payload.name || "").trim();
  var visitorId = String(payload.visitorId || "").trim();
  var page = String(payload.page || "").trim();
  var referrer = String(payload.referrer || "").trim();
  var userAgent = String(payload.userAgent || "").trim();

  sheet.appendRow([
    createdAt,
    rating,
    name,
    visitorId,
    page,
    referrer,
    userAgent,
  ]);

  var label = name || "Аноним";
  notifyTelegram_(
    "Новая оценка портфолио: " +
      rating +
      "/5\n" +
      "Имя: " +
      label +
      "\n" +
      "ID: " +
      (visitorId || "—") +
      "\n" +
      page,
  );

  return jsonResponse_({ ok: true });
}

function listRatings_(adminKey) {
  if (!adminKey || adminKey !== getAdminKey_()) {
    return jsonResponse_({ ok: false, error: "unauthorized" });
  }

  var sheet = getSheet_();
  var values = sheet.getDataRange().getValues();

  if (values.length <= 1) {
    return jsonResponse_({ ok: true, records: [] });
  }

  var records = [];

  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    records.push({
      createdAt: String(row[0] || ""),
      rating: Number(row[1] || 0),
      name: String(row[2] || ""),
      visitorId: String(row[3] || ""),
      page: String(row[4] || ""),
      referrer: String(row[5] || ""),
      userAgent: String(row[6] || ""),
    });
  }

  records.reverse();

  return jsonResponse_({ ok: true, records: records });
}

// --- Точки входа Web App (должны быть в корне файла, не внутри myFunction) ---

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);

    if (payload.action === "submit") {
      return submitRating_(payload);
    }

    return jsonResponse_({ ok: false, error: "unknown_action" });
  } catch (error) {
    return jsonResponse_({ ok: false, error: String(error) });
  }
}

function doGet(e) {
  var action = e.parameter.action;
  var key = e.parameter.key;

  if (action === "list") {
    return listRatings_(key);
  }

  if (action === "submit") {
    return submitRating_(e.parameter);
  }

  return jsonResponse_({ ok: false, error: "unknown_action" });
}

/** Запуск из редактора: Run → testSubmit_ — проверка записи в таблицу */
function testSubmit_() {
  var result = submitRating_({
    action: "submit",
    rating: 5,
    name: "Тест из редактора",
    visitorId: "editor-test",
    page: "https://plekhov.online",
    referrer: "",
    userAgent: "AppsScript",
  });
  Logger.log(result.getContent());
}
