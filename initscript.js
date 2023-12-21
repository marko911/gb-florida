let reservedDates = [];
let startDateSelected;
let endDateSelected;
let rates;
let numDays;

const getDaysArray = function (s, e) {
  for (var a = [], d = new Date(s); d < e; d.setDate(d.getDate() + 1)) {
    a.push(new Date(d));
  }
  return a;
};

const disabledOverlay = document.getElementById("form-disabled-overlay");

function setEndDatePickerOptions() {
  const endPickerOptions = {
    format: "mm-dd-yyyy",
    date: "",
    filter: function (date) {
      console.log(
        `end date is ${date.toDateString()} and is reserved? ${reservedDates.includes(
          date.toDateString()
        )}`
      );
      if (
        reservedDates.includes(date.toDateString()) ||
        date <= new Date() ||
        $('[data-toggle="datepicker-start"]').datepicker("getDate") >= date
      ) {
        return false; //
      }
    },
  };

  $('[data-toggle="datepicker-end"]').datepicker(endPickerOptions);
}

// Fetch Calendar from VRBO
const setReservedDates = async () => {
  const res = await fetch("https://gbs-api-kappa.vercel.app/api/calendar");
  const calendar = await res.json();
  Object.values(calendar)
    .filter(({ start }) => new Date(start) > Date.now())
    .forEach(({ start, end }) => {
      const dates = getDaysArray(new Date(start), new Date(end)).map((d) =>
        d.toDateString()
      );

      reservedDates = reservedDates.concat(dates);
    });
  console.log({ reservedDates });
};

// Fetch Calendar from VRBO
function setStartPickerDates() {
  disabledOverlay.style.display = "none";
  // Arrival date
  $('[data-toggle="datepicker-start"]').datepicker({
    format: "mm-dd-yyyy",
    date: "",
    filter: filterStart,
  });
}
// Initialize when ready
$(document).ready(async function () {
  rates = await getRates();
  console.log('fast console rates', {rates});  
  if (window.innerWidth < 768) {
    $('[data-toggle="datepicker-start"]').attr("readonly", "readonly");
    $('[data-toggle="datepicker-end"]').attr("readonly", "readonly");
  }
  disabledOverlay.style["z-index"] = 1;
  await setReservedDates();

  setStartPickerDates();
  setEndDatePickerOptions();
});

function filterStart(date) {
  //	console.log('date: ',date, {isReserved: reservedDates.includes(date), beforeToday:date <= Date.now()});
  if (reservedDates.includes(date.toDateString()) || date <= Date.now()) {
    //    console.log('false for: ',date, { first: reservedDates.includes(date), second: date <= Date.now() })
    return false;
  }
  return true;
}

const startPicker = $('[data-toggle="datepicker-start"]');
const endPicker = $('[data-toggle="datepicker-end"]');

// startPicker.on("click", () => {
//   startDateSelected = startPicker.datepicker("getDate");
// });

endPicker.on("click", () => {
  // endDateSelected = endPicker.datepicker("getDate");
  endPicker.data('datepicker').setViewDate(startDateSelected);
  console.log(  'check obj datepicker', endPicker.data('datepicker') );
// endPicker.datepicker.setViewDate(endDateSelected);
});

endPicker.on("pick.datepicker", (e) => {
  endDateSelected = endPicker.datepicker('getDate');
  numDays = (endDateSelected - startDateSelected) / (1000 * 60 * 60 * 24);
  console.log('numDays', numDays);
  // endPicker.datepicker("reset");
  // endPicker.datepicker('setStartDate', startDateSelected);
  // endPicker.datepicker('setEndDate', endDateSelected);
})

startPicker.on("pick.datepicker", (e) => {
  // endPicker.datepicker("reset");
  startDateSelected = startPicker.datepicker('getDate');

  endPicker.datepicker('setStartDate', startDateSelected);
});

const getRates = async () => {
  const res = await fetch("https://gbs-api-kappa.vercel.app/api/sheets");
  const rates = await res.json();
  const flat = rates.map((r) => Object.values(r)).flat();
  const table = $("#rates-table");
  for (let i = 0; i < flat.length; i++) {
    const rate = flat[i];

    const el =
      '<div id="w-node-_42d8af8a-12be-d9dd-d6d1-fa898d104be9-f307f5de" class="rate-cell"><div class="text-block">' +
      rate +
      "<br /></div></div>";
    table.append(el);
  }

  return rates;
};
