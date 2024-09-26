$(document).ready(function () {
emptyForm();
$("#uadmissionno").on("input", function () {
        const admissionno = $(this).val().trim();
        if(admissionno){
            $.ajax({
                url: `http://localhost:4000/check_patient/${admissionno}`,
                method: "GET",
                success: function (data) {
                    if (data.exists) {
                        $("#upatientIDStatus").removeClass("error");
                        $("#upatientIDStatus").text("");
                        $("#updateButton").prop("disabled", false);
                        populateForm(data.patient);
                    } else {
                        $("#upatientIDStatus").addClass("error");
                        $("#upatientIDStatus").text("Patient does not exists");
                        $("#updateButton").prop("disabled", true);
                        emptyForm();
                    }
                },
                error: function () {
                    $("#upatientIDStatus").text("Error checking patient ID").addClass("error");
                }
            });
        }else{
            $("#upatientIDStatus").removeClass("error");
            $("#upatientIDStatus").text("");
        }
});
function populateForm(patient) {
        $("#ufname").val(patient.fname);
        $("#ulname").val(patient.lname);
        $("#ucnic_no").val(patient.cnic_no);
        $("#ugender").val(patient.gender);
        $("#uage").val(patient.age);
        $("#uphone").val(patient.phone);
        $("#udoctorid").val(patient.doctorid);
        $("#ustaffid").val(patient.staffid);
        $("#uwardno").val(patient.wardno);
        $("#ustatus").val(patient.status);

        $(".uallmedicine").empty();
        if(patient.medicalInfo.length > 0){
        patient.medicalInfo.forEach((medicine, index) => {
            const medicineEntry = `
                <div class="medicine">
                    <div class="ms-details title-3 white1 mb-3">
                        <span>#${index + 1}</span>
                        <span class="remove">
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#E4E6EB">
                                <path d="M200-440v-80h560v80H200Z"/>
                            </svg>
                        </span>
                    </div>
                    <div class="f-grid" style="margin-bottom: 2rem;">
                        <div>
                            <label for="umedicineid">Medicine:</label>
                            <input type="text" class="umedicineid" placeholder="Select Medicine" name="umedicineid[]" value="${medicine.medicineid}" readonly>
                        </div>
                        <div>
                            <label for="uquantity">Quantity:</label>
                            <input type="number" class="uquantity" name="uquantity[]" value="${medicine.quantity}">
                        </div>
                    </div>
                </div>
            `;
            $(".uallmedicine").append(medicineEntry);
        
        });
    }

        $(".uallServices").empty();
        if(patient.serviceInfo.length >0){
        patient.serviceInfo.forEach((service, index) => {
            const serviceEntry = `
                <div class="service">
                    <div class="ms-details title-3 white1 mb-3">
                        <span>#${index + 1}</span>
                        <span class="remove">
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#E4E6EB">
                                <path d="M200-440v-80h560v80H200Z"/>
                            </svg>
                        </span>
                    </div>
                    <div class="f-grid" style="margin-bottom: 2rem;">
                        <div>
                            <label for="serviceid">Service:</label>
                            <input type="text" class="userviceid" placeholder="Select Service" name="serviceid[]" value="${service.serviceid}" readonly>
                        </div>
                        <div>
                            <label for="no_of_days">Number of Days:</label>
                            <input type="number" class="uno_of_days" name="no_of_days[]" value="${service.no_of_days}">
                        </div>
                    </div>
                </div>
            `;
            $(".uallServices").append(serviceEntry);
        });
        }
            $("#ufname").prop('disabled', false);
            $("#ulname").prop('disabled', false);
            $("#ucnic_no").prop('disabled', false);
            $("#ugender").prop('disabled', false);
            $("#uage").prop('disabled', false);
            $("#uphone").prop('disabled', false);
            $("#udoctorid").prop('disabled', false);
            $("#ustaffid").prop('disabled', false);
            $("#uwardno").prop('disabled', false);
            $("#ustatus").prop('disabled', false);
            $(".uaddMedicine").prop('disabled', false);
            $(".uaddService").prop('disabled', false);
        
}
function emptyForm() {
    $("#ufname").val('');
    $("#ulname").val('');
    $("#ucnic_no").val('');
    $("#ugender").val('');
    $("#uage").val('');
    $("#uphone").val('');
    $("#udoctorid").val('');
    $("#ustaffid").val('');
    $("#uwardno").val('');
    $("#ustatus").val('');
    $(".uallmedicine").empty();
    $(".uallServices").empty();
    $("#ufname").prop('disabled', true);
    $("#ulname").prop('disabled', true);
    $("#ucnic_no").prop('disabled', true);
    $("#ugender").prop('disabled', true);
    $("#uage").prop('disabled', true);
    $("#uphone").prop('disabled', true);
    $("#udoctorid").prop('disabled', true);
    $("#ustaffid").prop('disabled', true);
    $("#uwardno").prop('disabled', true);
    $("#ustatus").prop('disabled', true);
    $(".uaddMedicine").prop('disabled', true);
    $(".uaddService").prop('disabled', true);
}

$("#updateinpatientForm").submit(function (e) {
        e.preventDefault();
    
        const admissionno = $("#uadmissionno").val().trim();
        const patientData = {
            fname: $("#ufname").val(),
            lname: $("#ulname").val(),
            cnic_no: $("#ucnic_no").val(),
            gender: $("#ugender").val(),
            age: $("#uage").val(),
            phone: $("#uphone").val(),
            doctorid: $("#udoctorid").val(),
            staffid: $("#ustaffid").val(),
            wardno: $("#uwardno").val(),
            status: $("#ustatus").val()
        };
    
        const umedicines = [];
        $(".uallmedicine .medicine").each(function () {
            umedicines.push({
                medicineid: $(this).find(".umedicineid").val(),
                quantity: $(this).find(".uquantity").val()
            });
        });
    
        const services = [];
        $(".uallServices .service").each(function () {
            services.push({
                serviceid: $(this).find(".userviceid").val(),
                no_of_days: $(this).find(".uno_of_days").val()
            });
        });
        console.log('Medicines:', medicines);
        console.log('Services:', services);
    
        $.ajax({
            url: 'http://localhost:4000/update_patient',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ admissionno, patientData, umedicines, services }),
            success: function (response) {
                console.log("Response:", response);
                alert("Inpatient Updated Successfully");
            },
            error: function () {
                alert('Error updating patient data');
                console.error("Error:", status, error);
            }
        });
});
    
// Add new medicine entry
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
$(".uaddService").click(function () {
    const form = $(this).closest("form");
    const uallServices = form.find(".uallServices");

    const newServiceEntry = `
        <div class="service">
            <div class="ms-details title-3 white1 mb-3">
                <span>#${uallServices.find(".service").length + 1}</span>
                <span class="uremove">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#E4E6EB">
                        <path d="M200-440v-80h560v80H200Z"/>
                    </svg>
                </span>
            </div>
            <div class="f-grid" style="margin-bottom: 2rem;">
                <div>
                    <label for="userviceid">Service:</label>
                    <input type="text" class="userviceid" placeholder="Select Service" name="userviceid[]" readonly>
                </div>
                <div>
                    <label for="uno_of_days">Number of Days:</label>
                    <input type="number" class="uno_of_days" name="uno_of_days[]">
                </div>
            </div>
        </div>
    `;
    
    uallServices.append(newServiceEntry);
});

// Remove Service Button
$(document).on("click", ".uremove", function () {
    const form = $(this).closest("form"); // Identify the form
    const serviceContainer = form.find(".uallServices");

    $(this).closest(".service").remove();

    // Update the numbers of the remaining service entries in the same form
    serviceContainer.find(".service").each(function (index) {
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
  $(document).on("click", ".userviceid", async function () {
    currentInput = $(this); // Store the reference to the current input field
    const dialog = document.getElementById("userviceDialog");
    const serviceList = $("#userviceList");
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
});