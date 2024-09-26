$(document).ready(function () {
  // Check if patient ID exists as the user types
  $("#patientid").on("input", function () {
    const patientid = $("#patientid").val();
    $.ajax({
      url: "http://localhost:4000/checkPatientID",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ patientid: patientid }),
      success: function (result) {
        if (result.exists) {
          $("#patientIDStatus").addClass("error");
          $("#patientIDStatus").text("Patient ID already exists");
          $("#addButton").prop("disabled", true);
        } else {
          $("#patientIDStatus").removeClass("error");
          $("#patientIDStatus").text("");
          $("#addButton").prop("disabled", false);
        }
      },
      error: function () {
        $("#patientIDStatus")
          .text("Error checking patient ID")
          .css("color", "red");
      },
    });
  });

  // Add new medicine fields
  $(".addMedicine").click(function () {
    const form = $(this).closest("form");
    const allMedicine = form.find(".allmedicine");
    
    const newMedicineEntry = `
        <div class="medicine">
            <div class="ms-details title-3 white1 mb-3">
                <span>#${allMedicine.find(".medicine").length + 1}</span>
                <span class="remove">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#E4E6EB">
                        <path d="M200-440v-80h560v80H200Z"/>
                    </svg>
                </span>
            </div>
            <div class="f-grid" style="margin-bottom: 2rem;">
                <div>
                    <label for="medicineid">Medicine:</label>
                    <input type="text" class="medicineid" placeholder="Select Medicine" name="medicineid[]" readonly>
                </div>
                <div>
                    <label for="quantity">Quantity:</label>
                    <input type="number" class="quantity" name="quantity[]">
                </div>
            </div>
        </div>
    `;
    
    allMedicine.append(newMedicineEntry);
});


  // Remove medicine entry
  $(document).on("click", ".remove", function () {
    const form = $(this).closest("form"); // Identify the form
    const medicineContainer = form.find(".allmedicine");

    $(this).closest(".medicine").remove();

    // Update the numbers of the remaining medicine entries in the same form
    medicineContainer.find(".medicine").each(function (index) {
        $(this).find(".ms-details span:first-child").text(`#${index + 1}`);
    });
});

  // Submit form
  $("#outpatientForm").submit(function (event) {
    event.preventDefault();

    const formData = {
      patientid: $("#patientid").val(),
      fname: $("#fname").val(),
      lname: $("#lname").val(),
      cnic_no: $("#cnic_no").val(),
      age: parseInt($("#age").val()),
      gender: $("#gender").val(),
      phone: $("#phone").val(),
      doctorid: $("#doctorID").val(),
      staffid: $("#staffID").val(),
      medicalInfo: [],
    };

    $(".medicine").each(function () {
      const medicineid = $(this).find(".medicineid").val();
      const quantity = parseInt($(this).find(".quantity").val());
      if (medicineid && quantity) {
        formData.medicalInfo.push({
          medicineid: medicineid,
          quantity: quantity,
        });
      }
    });

    $.ajax({
      url: "http://localhost:4000/add_outpatient",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify(formData),
      success: function (response) {
        alert("Outpatient and related info added successfully");
        $("#outpatientForm")[0].reset();
      },
      error: function () {
        alert("Error adding outpatient");
      },
    });
  });

  // Fetch list of active doctors when doctor input field is clicked
  $(document).on("click", ".doctorid", async function () {
    const parentForm = $(this).closest("form"); // Get the parent form
    const dialog = parentForm.find("#doctorDialog")[0]; // Get the dialog associated with the parent form
    const doctorList = parentForm.find(".doctorList");
    doctorList.empty(); // Clear previous table content

    try {
      const response = await fetch("http://localhost:4000/activeDoctors");
      const doctors = await response.json();

      // Create a table to display doctors
      const table = $("<table>").addClass("dialog-table").appendTo(doctorList);
      const header = $("<tr>").appendTo(table);
      $("<th>").text("ID").appendTo(header);
      $("<th>").text("Name").appendTo(header);
      $("<th>").text("Specialization").appendTo(header);

      // Add rows for each doctor
      doctors.forEach(function (doctor) {
        const row = $("<tr>").appendTo(table);
        $("<td>").text(doctor.doctorid).appendTo(row);
        $("<td>").text(`${doctor.fname} ${doctor.lname}`).appendTo(row);
        $("<td>").text(doctor.specialization).appendTo(row);

        // Add click event to each row
        row.click(function () {
          const selectedDoctorId = doctor.doctorid;
          parentForm.find(".doctorid").val(selectedDoctorId); // Set the value of the doctorid input
          dialog.close();
        });
      });

      dialog.showModal();
    } catch (error) {
      console.error("Error fetching doctors:", error);
      alert("Error fetching doctors");
    }
});

// Close the doctor dialog when the close button is clicked
$(document).on("click", ".close-btn", function (event) {
    event.preventDefault();
    const dialog = $(this).closest(".dialog")[0];
    dialog.close();
});

  $(document).on("click", ".staffid", async function () {
    const dialog = $(this).siblings(".dialog")[0]; // Get the dialog associated with the clicked staffid input
    const staffList = $(this).siblings(".dialog").find(".staffList");
    staffList.empty(); // Clear previous table content

    try {
      const response = await fetch("http://localhost:4000/activeStaff");
      const staffMembers = await response.json();

      // Create a table to display staff members
      const table = $("<table>").addClass("dialog-table").appendTo(staffList);
      const header = $("<tr>").appendTo(table);
      $("<th>").text("ID").appendTo(header);
      $("<th>").text("Name").appendTo(header);
      $("<th>").text("Designation").appendTo(header);

      // Add rows for each staff member
      staffMembers.forEach(function (staff) {
        const row = $("<tr>").appendTo(table);
        $("<td>").text(staff.staffid).appendTo(row);
        $("<td>").text(`${staff.fname} ${staff.lname}`).appendTo(row);
        $("<td>").text(staff.designation).appendTo(row);

        // Add click event to each row
        row.click(function () {
          const selectedStaffId = staff.staffid;
          $(this).closest(".dialog").siblings(".staffid").val(selectedStaffId); // Set the value of the staffid input
          dialog.close();
        });
      });

      dialog.showModal();
    } catch (error) {
      console.error("Error fetching staff:", error);
      alert("Error fetching staff");
    }
});
  // Close the staff dialog when the close button is clicked
  $(document).on("click", "#closeStaffDialog", function (event) {
    event.preventDefault();
    $(this).closest(".dialog")[0].close();
});


let currentInput; // Variable to store the current input field

  // Open medicine dialog when any medicine input is clicked
$(document).on("click", ".medicineid", async function () {
    currentInput = $(this); // Store the reference to the current input field
    const dialog = document.getElementById("medicineDialog");
    const medicineList = $("#medicineList");
    medicineList.empty(); // Clear previous table content

    try {
      const response = await fetch("http://localhost:4000/activeMedicines");
      const medicines = await response.json();

      // Create a table to display medicines
      const table = $("<table>")
        .addClass("dialog-table")
        .appendTo(medicineList);
      const header = $("<tr>").appendTo(table);
      $("<th>").text("ID").appendTo(header);
      $("<th>").text("Name").appendTo(header);
      $("<th>").text("Manufacturer").appendTo(header);

      // Add rows for each medicine
      medicines.forEach(function (medicine) {
        const row = $("<tr>").appendTo(table);
        $("<td>").text(medicine.medicineid).appendTo(row);
        $("<td>").text(medicine.medicineName).appendTo(row);
        $("<td>").text(medicine.manufacturer).appendTo(row);

        // Add click event to each row
        row.click(function () {
          const selectedMedicineId = medicine.medicineid;

          // Check if the medicine is already selected
          let isDuplicate = false;
          $(".medicineid").each(function () {
            if ($(this).val() === selectedMedicineId) {
              isDuplicate = true;
              return false; // Break the loop
            }
          });

          if (isDuplicate) {
            alert("This medicine is already selected. Please choose another.");
          } else {
            currentInput.val(selectedMedicineId); // Set the value of the current input field
            dialog.close();
          }
        });
      });

      dialog.showModal();
    } catch (error) {
      console.error("Error fetching medicines:", error);
      alert("Error fetching medicines");
    }
  });

  // Close the medicine dialog when the close button is clicked
  $("#closeMedicineDialog").click(function () {
    document.getElementById("medicineDialog").close();
  });

  // Function to fetch outpatients based on gender
function fetchOutpatients(gender) {
  $.ajax({
      type: 'GET',
      url: 'http://localhost:4000/outpatients',
      data: { gender: gender },
      success: function(outpatients) {
          if (outpatients.length > 0) {
              displayOutpatients(outpatients);
              $('#errorDisplay').hide(); // Hide error message if data is available
          } else {
              $('#outpatientList').empty(); // Clear outpatient list
              $('#errorDisplay').show(); // Show error message
          }
      },
      error: function(xhr, status, error) {
          console.error('Error fetching outpatients:', error);
          alert('Error fetching outpatients. Please try again.');
      }
  });
}

// Function to display outpatients
function displayOutpatients(outpatients) {
  // Clear previous outpatient list
  $('#outpatientList').empty();

  // Create a table to display outpatients
  const table = $('<table>').appendTo('#outpatientList');
  const header = $('<tr>').appendTo(table);
  $('<th>').text('ID').appendTo(header);
  $('<th>').text('First Name').appendTo(header);
  $('<th>').text('Last Name').appendTo(header);
  $('<th>').text('CNIC').appendTo(header);
  $('<th>').text('Gender').appendTo(header);
  $('<th>').text('Age').appendTo(header);
  $('<th>').text('Phone No').appendTo(header);

  // Add rows for each outpatient
  outpatients.forEach(function(outpatient) {
      const row = $('<tr>').appendTo(table);
      $('<td>').text(outpatient.patientid).appendTo(row);
      $('<td>').text(outpatient.fname).appendTo(row);
      $('<td>').text(outpatient.lname).appendTo(row);
      $('<td>').text(outpatient.cnic_no).appendTo(row);
      $('<td>').text(outpatient.gender).appendTo(row);
      $('<td>').text(outpatient.age).appendTo(row);
      $('<td>').text(outpatient.phone).appendTo(row);
  });
}

// Function to search outpatients based on query
function searchOutpatients(query) {
  $.ajax({
      type: 'GET',
      url: 'http://localhost:4000/searchOutpatients',
      data: { query: query },
      success: function(outpatients) {
          if (outpatients.length > 0) {
              displayOutpatients(outpatients);
              $('#errorDisplay').hide(); // Hide error message if data is available
          } else {
              $('#outpatientList').empty(); // Clear outpatient list
              $('#errorDisplay').show(); // Show error message
          }
      },
      error: function(xhr, status, error) {
          console.error('Error searching outpatients:', error);
          alert('Error searching outpatients. Please try again.');
      }
  });
}

// Event listener for search input
$('#searchInput').on('input', function() {
  const query = $(this).val().trim();
  searchOutpatients(query);
});

// Event listener for buttons
$('#buttons button').click(function() {
  // Remove the 'active' class from all buttons
  $('#buttons button').removeClass('active');
  
  // Add the 'active' class to the clicked button
  $(this).addClass('active');

  // Fetch outpatients based on the clicked button
  const gender = $(this).text();
  if (gender === 'All') {
      fetchOutpatients();
  } else {
      fetchOutpatients(gender);
  }
});
fetchOutpatients();

$(document).on("click", ".uaddMedicine", function () {
  const form = $(this).closest("form");
  const uallMedicine = form.find(".uallmedicine");

  const newMedicineEntry = `
      <div class="medicine">
          <div class="ms-details title-3 white1 mb-3">
              <span>#${uallMedicine.find(".medicine").length + 1}</span>
              <span class="uremove">
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#E4E6EB">
                      <path d="M200-440v-80h560v80H200Z"/>
                  </svg>
              </span>
          </div>
          <div class="f-grid" style="margin-bottom: 2rem;">
              <div>
                  <label for="umedicineid">Medicine:</label>
                  <input type="text" class="umedicineid" placeholder="Select Medicine" name="umedicineid[]" readonly>
              </div>
              <div>
                  <label for="uquantity">Quantity:</label>
                  <input type="number" class="uquantity" name="uquantity[]">
              </div>
          </div>
      </div>
  `;

  uallMedicine.append(newMedicineEntry);
});

// Remove medicine entry
$(document).on("click", ".uremove", function () {
  const form = $(this).closest("form"); // Identify the form
  const medicineContainer = form.find(".uallmedicine");

  $(this).closest(".medicine").remove();

  // Update the numbers of the remaining medicine entries in the same form
  medicineContainer.find(".medicine").each(function (index) {
      $(this).find(".ms-details span:first-child").text(`#${index + 1}`);
  });
});
$(document).on("click", ".umedicineid", async function () {
  currentInput = $(this); // Store the reference to the current input field
  const dialog = document.getElementById("umedicineDialog");
  const medicineList = $("#umedicineList");
  medicineList.empty(); // Clear previous table content

  try {
    const response = await fetch("http://localhost:4000/activeMedicines");
    const medicines = await response.json();

    // Create a table to display medicines
    const table = $("<table>")
      .addClass("dialog-table")
      .appendTo(medicineList);
    const header = $("<tr>").appendTo(table);
    $("<th>").text("ID").appendTo(header);
    $("<th>").text("Name").appendTo(header);
    $("<th>").text("Manufacturer").appendTo(header);

    // Add rows for each medicine
    medicines.forEach(function (medicine) {
      const row = $("<tr>").appendTo(table);
      $("<td>").text(medicine.medicineid).appendTo(row);
      $("<td>").text(medicine.medicineName).appendTo(row);
      $("<td>").text(medicine.manufacturer).appendTo(row);

      // Add click event to each row
      row.click(function () {
        const selectedMedicineId = medicine.medicineid;

        // Check if the medicine is already selected
        let isDuplicate = false;
        $(".umedicineid").each(function () {
          if ($(this).val() === selectedMedicineId) {
            isDuplicate = true;
            return false; // Break the loop
          }
        });

        if (isDuplicate) {
          alert("This medicine is already selected. Please choose another.");
        } else {
          currentInput.val(selectedMedicineId); // Set the value of the current input field
          dialog.close();
        }
      });
    });

    dialog.showModal();
  } catch (error) {
    console.error("Error fetching medicines:", error);
    alert("Error fetching medicines");
  }
});
});
