$(document).ready(function() {
    $("#uadmissionno").on("input", function () {
        const admissionno = $(this).val().trim();
        if (admissionno) {
            $.ajax({
                url: `http://localhost:4000/check_outpatient/${admissionno}`,
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
        } else {
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
    
        $(".uallmedicine").empty();
        if (patient.medicalInfo.length > 0) {
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
    
        $("#ufname").prop('disabled', false);
        $("#ulname").prop('disabled', false);
        $("#ucnic_no").prop('disabled', false);
        $("#ugender").prop('disabled', false);
        $("#uage").prop('disabled', false);
        $("#uphone").prop('disabled', false);
        $("#udoctorid").prop('disabled', false);
        $("#ustaffid").prop('disabled', false);
        $(".uaddMedicine").prop('disabled', false);
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
        $(".uallmedicine").empty();
        $("#ufname").prop('disabled', true);
        $("#ulname").prop('disabled', true);
        $("#ucnic_no").prop('disabled', true);
        $("#ugender").prop('disabled', true);
        $("#uage").prop('disabled', true);
        $("#uphone").prop('disabled', true);
        $("#udoctorid").prop('disabled', true);
        $("#ustaffid").prop('disabled', true);
        $(".uaddMedicine").prop('disabled', true);
    }
    
    $("#updateOutpatientForm").submit(function (e) {
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
        };
    
        const umedicines = [];
        $(".uallmedicine .medicine").each(function () {
            umedicines.push({
                medicineid: $(this).find(".umedicineid").val(),
                quantity: $(this).find(".uquantity").val()
            });
        });
    
        console.log('Medicines:', umedicines);
    
        $.ajax({
            url: 'http://localhost:4000/update_outpatient',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ admissionno, patientData, umedicines }),
            success: function (response) {
                console.log("Response:", response);
                alert("Outpatient Updated Successfully");
                $("#uadmissionno").val('')
                emptyForm();
            },
            error: function () {
                alert('Error updating patient data');
                console.error("Error:", status, error);
            }
        });
    });
    
});