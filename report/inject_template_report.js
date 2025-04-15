const fs = require("fs");

function buildEmailHTML({ total, passed, failed, duration, date, reportLink }) {
  let template = fs.readFileSync("./Template/index.html", "utf-8");

  return template
    .replace("{{total}}", total)
    .replace("{{passed}}", passed)
    .replace("{{failed}}", failed)
    .replace("{{duration}}", duration)
    .replace("{{date}}", date)
    .replace("{{reportLink}}", reportLink || "#");


    // const html = buildEmailHTML({
    //     total: 12,
    //     passed: 10,
    //     failed: 2,
    //     duration: "35s",
    //     date: new Date().toLocaleString(),
    //     reportLink: "https://your-report-link"
    //   });
}
