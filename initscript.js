let reservedDates = [];
let startDateSelected;
let endDateSelected;
let rates;
let numDaysToRate = {};

/* global $ */

// INIT -------------------------

$(document).ready(async function () {
  rates = await getRates();
  $('#calendar-form').find(':input').prop('disabled', true);
  if (window.innerWidth < 768) {
    $('[data-toggle="datepicker-start"]').attr('readonly', 'readonly');
    $('[data-toggle="datepicker-end"]').attr('readonly', 'readonly');
  }
  disabledOverlay.style['z-index'] = 1;
  await setReservedDates();

  setStartPickerDates();
  setEndDatePickerOptions();

  $('#calendar-form').find(':input').prop('disabled', false);
});

// END INIT --------------------------

let numDays = createObservableVariable(0, (newValue) => {
  if (newValue > 0) {
    console.log('fast console num days setter', newValue);
    const priceDiv = $('#price-box');
    priceDiv.show();
  }
});

const getDaysArray = function (s, e) {
  for (var a = [], d = new Date(s); d < e; d.setDate(d.getDate() + 1)) {
    a.push(new Date(d));
  }
  return a;
};

const disabledOverlay = document.getElementById('form-disabled-overlay');

function setEndDatePickerOptions() {
  const endPickerOptions = {
    format: 'mm-dd-yyyy',
    date: '',
    filter: function (date) {
      if (
        reservedDates.includes(date.toDateString()) ||
        date <= new Date() ||
        $('[data-toggle="datepicker-start"]').datepicker('getDate') >= date
      ) {
        return false; //
      }
    },
  };

  $('[data-toggle="datepicker-end"]').datepicker(endPickerOptions);
}

// Fetch Calendar from VRBO
const setReservedDates = async () => {
  const res = await fetch('https://gbs-api-kappa.vercel.app/api/calendar');
  const calendar = await res.json();
  Object.values(calendar)
    .filter(({ start }) => new Date(start) > Date.now())
    .forEach(({ start, end }) => {
      const dates = getDaysArray(new Date(start), new Date(end)).map((d) =>
        d.toDateString()
      );

      reservedDates = reservedDates.concat(dates);
    });
};

// Fetch Calendar from VRBO
function setStartPickerDates() {
  disabledOverlay.style.display = 'none';
  // Arrival date
  $('[data-toggle="datepicker-start"]').datepicker({
    format: 'mm-dd-yyyy',
    date: '',
    filter: filterStart,
  });
}
// Initialize when ready


function filterStart(date) {
  if (reservedDates.includes(date.toDateString()) || date <= Date.now()) {
    return false;
  }
  return true;
}

const startPicker = $('[data-toggle="datepicker-start"]');
const endPicker = $('[data-toggle="datepicker-end"]');

// startPicker.on("click", () => {
//   startDateSelected = startPicker.datepicker("getDate");
// });

endPicker.on('click', () => {
  // endDateSelected = endPicker.datepicker("getDate");
  endPicker.data('datepicker').setViewDate(startDateSelected);
  console.log('check obj datepicker', endPicker.data('datepicker'));
// endPicker.datepicker.setViewDate(endDateSelected);
});







endPicker.on('pick.datepicker', (e) => {
  endDateSelected = endPicker.datepicker('getDate');
  startDateSelected = startPicker.datepicker('getDate');

  let daysToRates = {};
  const parseRate = (rateStr) => parseFloat(rateStr.replace(/[^\d.]/g, ''));

  for (let d = new Date(startDateSelected); d <= endDateSelected; d.setDate(d.getDate() + 1)) {
    let date = new Date(d);
    let dayOfWeek = date.getDay();
    let rateKey;
    let rate = 0;

    // Find the applicable rate for this date
    for (let rateInfo of rates) {
      let from = new Date(rateInfo.from);
      let to = new Date(rateInfo.to);
      if (date >= from && date <= to) {
        if (dayOfWeek === 5 || dayOfWeek === 6) { // Weekend nights (Friday or Saturday)
          rate = parseRate(rateInfo.weekendNight);
          rateKey = `weekend nights @ ${rateInfo.weekendNight}`;
        } else { // Weekdays
          rate = parseRate(rateInfo.nightly);
          rateKey = `weekday nights @ ${rateInfo.nightly}`;
        }
        break;
      }
    }

    if (!daysToRates[rateKey]) {
      daysToRates[rateKey] = { count: 0, rate: rate, total: 0 };
    }
    daysToRates[rateKey].count++;
    daysToRates[rateKey].total = daysToRates[rateKey].count * daysToRates[rateKey].rate;
  }

  // numDays.value = Object.values(daysToRates).length;

  renderRates(daysToRates);
});



function renderRates(daysToRates) {
  let subtotal = 0;
  const taxRate = 0.125; // Adjust the tax rate as needed
  let htmlContent = '';

  $.each(daysToRates, (key, value) => {
    subtotal += value.total;

    console.log('key', key);
    let parts = key.split(/(?= @)/);

    htmlContent += `
      <div class="rate-row">
        <span>${value.count} ${parts[0]}</span>
        <span> ${parts[1]}/night </span>
      </div>`;
  });

  const cleaningFee = 220;
  const tax = (subtotal + cleaningFee) * taxRate;
  const total = subtotal + cleaningFee + tax;

  // Add the subtotal, tax, and total rows
  htmlContent += `
    <div class="totals">
    <div class="total-row">Subtotal</strong><span>$${subtotal.toFixed(2)}</span></div>

    <div class="total-row">Cleaning Fee<span>$${cleaningFee.toFixed(2)}</span></div>
    <div class="total-row">Tax<span>$${tax.toFixed(2)}</span></div>
    <div class="total-row"><strong>Total</strong><span>$${total.toFixed(2)}</span></div>
    </div>
    `;


  // Update the deal-card container inside the price-box
  $('#price-box .deal-card').html(htmlContent);
  $('#price-box').show();
}


startPicker.on('pick.datepicker', (e) => {
  startDateSelected = startPicker.datepicker('getDate');

  // endPicker.datepicker('setDate', startDateSelected).trigger('pick.datepicker');
  startPicker.datepicker('hide');
});

const getRates = async () => {
  const res = await fetch('https://gbs-api-kappa.vercel.app/api/sheets');
  const rates = await res.json();
  console.log(rates.map(({ from, to })=>({ from, to })));
  const flat = rates.map((r) => Object.values(r).slice(2)).flat();
  const table = $('#rates-table');
  for (let i = 0; i < flat.length; i++) {
    const rate = flat[i];

    const el =
      '<div id="w-node-_42d8af8a-12be-d9dd-d6d1-fa898d104be9-f307f5de" class="rate-cell"><div class="text-block">' +
      rate +
      '<br /></div></div>';
    table.append(el);
  }

  return rates;
};

function createObservableVariable(initialValue, onChange) {
  let value = initialValue;

  return {
    get value() {
      return value;
    },
    set value(newValue) {
      if (value !== newValue) {
        value = newValue;
        onChange(newValue);
      }
    }
  };
}
