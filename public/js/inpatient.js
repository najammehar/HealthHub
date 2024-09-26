$(document).ready(function () {
    // Function to fetch inpatients based on status
function fetchInpatients(status) {
    $.ajax({
        type: 'GET',
        url: 'http://localhost:4000/inpatients',
        data: { status: status },
        success: function(inpatients) {
            if (inpatients.length > 0) {
                displayInpatients(inpatients);
                $('#errorDisplay').hide(); // Hide error message if data is available
            } else {
                $('#inpatientList').empty(); // Clear inpatient list
                $('#errorDisplay').show(); // Show error message
            }
        },
        error: function(xhr, status, error) {
            console.error('Error fetching inpatients:', error);
            alert('Error fetching inpatients. Please try again.');
        }
    });
  }
  
  // Function to display inpatients
  function displayInpatients(inpatients) {
    // Clear previous inpatient list
    $('#inpatientList').empty();
  
    // Create a table to display inpatients
    const table = $('<table>').appendTo('#inpatientList');
    const header = $('<tr>').appendTo(table);
    $('<th>').text('ID').appendTo(header);
    $('<th>').text('First Name').appendTo(header);
    $('<th>').text('Last Name').appendTo(header);
    $('<th>').text('CNIC').appendTo(header);
    $('<th>').text('Gender').appendTo(header);
    $('<th>').text('Age').appendTo(header);
    $('<th>').text('Phone No').appendTo(header);
    $('<th>').text('Status').appendTo(header);
  
    // Add rows for each inpatient
    inpatients.forEach(function(inpatient) {
        const row = $('<tr>').appendTo(table);
        $('<td>').text(inpatient.admissionno).appendTo(row);
        $('<td>').text(inpatient.fname).appendTo(row);
        $('<td>').text(inpatient.lname).appendTo(row);
        $('<td>').text(inpatient.cnic_no).appendTo(row);
        $('<td>').text(inpatient.gender).appendTo(row);
        $('<td>').text(inpatient.age).appendTo(row);
        $('<td>').text(inpatient.phone).appendTo(row);
        $('<td>').text(inpatient.status).appendTo(row);
    });
  }
  
  // Function to search inpatients based on query
  function searchInpatients(query) {
    $.ajax({
        type: 'GET',
        url: 'http://localhost:4000/searchInpatients',
        data: { query: query },
        success: function(inpatients) {
            if (inpatients.length > 0) {
                displayInpatients(inpatients);
                $('#errorDisplay').hide(); // Hide error message if data is available
            } else {
                $('#inpatientList').empty(); // Clear inpatient list
                $('#errorDisplay').show(); // Show error message
            }
        },
        error: function(xhr, status, error) {
            console.error('Error searching inpatients:', error);
            alert('Error searching inpatients. Please try again.');
        }
    });
  }
  
  // Event listener for search input
  $('#searchInput').on('input', function() {
    const query = $(this).val().trim();
    searchInpatients(query);
  });
  
  // Event listener for buttons
  $('#buttons button').click(function() {
    // Remove the 'active' class from all buttons
    $('#buttons button').removeClass('active');
    
    // Add the 'active' class to the clicked button
    $(this).addClass('active');
  
    // Fetch inpatients based on the clicked button
    const status = $(this).text();
    if (status === 'All') {
        fetchInpatients();
    } else {
        fetchInpatients(status);
    }
  });
  fetchInpatients();

  // Check if patient ID exists as the user types
$("#admissionno").on("input", function () {
    const admissionno = $("#admissionno").val();
    $.ajax({
        url: "http://localhost:4000/checkInPatientID",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({ admissionno: admissionno }),
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
            $("#patientIDStatus").text("Error checking patient ID").css("color", "red");
        },
    });
});

// Add new service fields
// Add Service Button
$(".addService").click(function () {
    const form = $(this).closest("form");
    const allServices = form.find(".allServices");

    const newServiceEntry = `
        <div class="service">
            <div class="ms-details title-3 white1 mb-3">
                <span>#${allServices.find(".service").length + 1}</span>
                <span class="remove">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#E4E6EB">
                        <path d="M200-440v-80h560v80H200Z"/>
                    </svg>
                </span>
            </div>
            <div class="f-grid" style="margin-bottom: 2rem;">
                <div>
                    <label for="serviceid">Service:</label>
                    <input type="text" class="serviceid" placeholder="Select Service" name="serviceid[]" readonly>
                </div>
                <div>
                    <label for="no_of_days">Number of Days:</label>
                    <input type="number" class="no_of_days" name="no_of_days[]">
                </div>
            </div>
        </div>
    `;
    
    allServices.append(newServiceEntry);
});

// Remove Service Button
$(document).on("click", ".remove", function () {
    const form = $(this).closest("form"); // Identify the form
    const serviceContainer = form.find(".allServices");

    $(this).closest(".service").remove();

    // Update the numbers of the remaining service entries in the same form
    serviceContainer.find(".service").each(function (index) {
        $(this).find(".ms-details span:first-child").text(`#${index + 1}`);
    });
});

// Submit form
$("#inpatientForm").submit(function (event) {
    event.preventDefault();

    const formData = {
        admissionno: $("#admissionno").val(),
        fname: $("#fname").val(),
        lname: $("#lname").val(),
        cnic_no: $("#cnic_no").val(),
        age: parseInt($("#age").val()),
        gender: $("#gender").val(),
        phone: $("#phone").val(),
        doctorid: $("#doctorid").val(),
        staffid: $("#staffid").val(),
        wardno: $("#wardno").val(),
        status: $("#status").val(),
        medicalInfo: [],
        serviceInfo: []
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

    $(".service").each(function () {
        const serviceid = $(this).find(".serviceid").val();
        const no_of_days = parseInt($(this).find(".no_of_days").val());
        if (serviceid && no_of_days) {
            formData.serviceInfo.push({
                serviceid: serviceid,
                no_of_days: no_of_days,
            });
        }
    });

    $.ajax({
        url: "http://localhost:4000/add_inpatient",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(formData),
        success: function (response) {
            alert("Inpatient and related info added successfully");
            $("#inpatientForm")[0].reset();
        },
        error: function () {
            alert("Error adding inpatient");
        },
    });
});

// Open service dialog when any service input is clicked
$(document).on("click", ".serviceid", async function () {
    currentInput = $(this); // Store the reference to the current input field
    const dialog = document.getElementById("serviceDialog");
    const serviceList = $("#serviceList");
    serviceList.empty(); // Clear previous table content

    try {
        const response = await fetch("http://localhost:4000/activeServices");
        if (!response.ok) {
            throw new Error('Failed to fetch services');
        }
        
        const services = await response.json();

        // Create a table to display services
        const table = $("<table>").addClass("dialog-table").appendTo(serviceList);
        const header = $("<tr>").appendTo(table);
        $("<th>").text("ID").appendTo(header);
        $("<th>").text("Name").appendTo(header);
        $("<th>").text("Description").appendTo(header);

        // Add rows for each service
        services.forEach(function (service) {
            const row = $("<tr>").appendTo(table);
            $("<td>").text(service.serviceid).appendTo(row);
            $("<td>").text(service.fullname).appendTo(row);
            $("<td>").text(service.serviceType).appendTo(row);

            // Add click event to each row
            row.click(function () {
                const selectedServiceId = service.serviceid;

                // Check if the service is already selected
                let isDuplicate = false;
                $(".serviceid").each(function () {
                    if ($(this).val() === selectedServiceId) {
                        isDuplicate = true;
                        return false; // Break the loop
                    }
                });

                if (isDuplicate) {
                    alert("This service is already selected. Please choose another.");
                } else {
                    currentInput.val(selectedServiceId); // Set the value of the current input field
                    dialog.close();
                }
            });
        });

        dialog.showModal();
    } catch (error) {
        console.error("Error fetching services:", error);
        alert("Error fetching services");
    }
});

// Fetch list of wards when ward input field is clicked
$(document).on("click", ".wardno", async function () {
    const parentForm = $(this).closest("form"); // Get the parent form
    const dialog = parentForm.find("#wardDialog")[0]; // Get the dialog associated with the parent form
    const wardList = parentForm.find(".wardList");
    wardList.empty(); // Clear previous table content

    try {
        const response = await fetch("http://localhost:4000/wards");
        const wards = await response.json();

        // Create a table to display wards
        const table = $("<table>").addClass("dialog-table").appendTo(wardList);
        const header = $("<tr>").appendTo(table);
        $("<th>").text("Ward No").appendTo(header);
        $("<th>").text("Type").appendTo(header);
        $("<th>").text("Capacity").appendTo(header);

        // Add rows for each ward
        wards.forEach(function (ward) {
            const row = $("<tr>").appendTo(table);
            $("<td>").text(ward.wardno).appendTo(row);
            $("<td>").text(ward.wardtype).appendTo(row);
            $("<td>").text(ward.capacity).appendTo(row);

            // Add click event to each row
            row.click(function () {
                const selectedWardNo = ward.wardno;
                parentForm.find(".wardno").val(selectedWardNo); // Set the value of the wardno input
                dialog.close();
            });
        });

        dialog.showModal();
    } catch (error) {
        console.error("Error fetching wards:", error);
        alert("Error fetching wards");
    }
});

// Close the ward dialog when the close button is clicked
$(document).on("click", ".close-btn", function (event) {
    event.preventDefault();
    const dialog = $(this).closest(".dialog")[0];
    dialog.close();
});
});