$(document).ready(function() {
    function checkPatientExists(patientid, type, callback) {
        const url = type === 'inpatient' ? `http://localhost:4000/checkinpatient/${patientid}` : `http://localhost:4000/checkoutpatient/${patientid}`;
        $.ajax({
            url: url,
            method: "GET",
            success: function(data) {
                if (data.exists) {
                    // Check bill status
                    const billCheckUrl = type === 'inpatient' ? `http://localhost:4000/checkinpatientbill/${patientid}` : `http://localhost:4000/checkoutpatientbill/${patientid}`;
                    $.ajax({
                        url: billCheckUrl,
                        method: "GET",
                        success: function(billData) {
                            callback({ exists: true, billStatus: billData.status });
                        },
                        error: function() {
                            callback({ exists: true, billStatus: 'error' });
                        }
                    });
                } else {
                    callback({ exists: false, billStatus: null });
                }
            },
            error: function() {
                callback({ exists: false, billStatus: null });
            }
        });
    }
    
    $("#InPatientBillBtn").on("click", function() {
        const patientid = $("#patientid").val();
        generateBill(patientid, 'inpatient');
    }); 
    $("#OutPatientBillBtn").on("click", function() {
        const patientid = $("#opatientid").val();
        generateBill(patientid, 'outpatient');
    });
    $("#patientid").on("input", function() {
        const patientid = $("#patientid").val().trim();
        if (patientid) {
            checkPatientExists(patientid, 'inpatient', function(data) {
                if (data.exists) {
                    $("#PatientIDError").removeClass('error');
                    $("#PatientIDError").text('');
                    if (data.billStatus !== 'Paid') {
                        $("#InPatientBillBtn").prop('disabled', false);
                    } else {
                        $("#InPatientBillBtn").prop('disabled', true);
                        $("#PatientIDError").addClass('error');
                        $("#PatientIDError").text("Bill already paid");
                    }
                } else {
                    $("#PatientIDError").addClass('error');
                    $("#PatientIDError").text("Patient does not exist");
                    $("#InPatientBillBtn").prop('disabled', true);
                }
            });
        } else {
            $("#PatientIDError").removeClass('error');
            $("#PatientIDError").text('');
            $("#InPatientBillBtn").prop('disabled', true);
        }
    });
    
    $("#opatientid").on("input", function() {
        const patientid = $("#opatientid").val().trim();
        if (patientid) {
            checkPatientExists(patientid, 'outpatient', function(data) {
                if (data.exists) {
                    $("#oPatientIDError").removeClass('error');
                    $("#oPatientIDError").text("");
                    if (data.billStatus !== 'Paid') {
                        $("#OutPatientBillBtn").prop('disabled', false);
                    } else {
                        $("#OutPatientBillBtn").prop('disabled', true);
                        $("#oPatientIDError").addClass('error');
                        $("#oPatientIDError").text("Bill already paid");
                    }
                } else {
                    $("#oPatientIDError").addClass('error');
                    $("#oPatientIDError").text("Patient does not exist");
                    $("#OutPatientBillBtn").prop('disabled', true);
                }
            });
        } else {
            $("#oPatientIDError").removeClass('error');
            $("#oPatientIDError").text("");
            $("#OutPatientBillBtn").prop('disabled', true);
        }
    });
    
    function generateBill(patientid, type) {
        const url = type === 'inpatient' ? `http://localhost:4000/generate_inpatient_bill` : `http://localhost:4000/generate_outpatient_bill`;
        $.ajax({
            url: url,
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({ patientid }),
            success: function(data) {
                let billDetailsHtml = `
                    <h3 class="title-3 white1 center mb-3">Bill Details</h3>
                    
                    <div class="mb-3" id="billContent">
                        <div class="b-display"><div class="text-2 white1">Patient ID</div><div class="text-2 white1">${patientid}</div></div>
                        <div class="" style="border-bottom: 0.5px solid white;"></div>
                        <div class="b-display"><div class="text-2 white1">${type === 'inpatient' ? 'Service Charges' : 'Fee'}</div><div class="text-2 white1">${data.service_fee || data.basicfee}</div></div>
                        <div class="b-display"><div class="text-2 white1">Medicine Charges</div><div class="text-2 white1">${data.medical_fee}</div></div>
                        <div class="b-display" style="border-bottom: 0.5px solid white;"><div class="text-2 white1">Tax</div><div class="text-2 white1">${data.tax}</div></div>
                        <div class="b-display"><div class="text-2 white1">Total Amount</div><div class="text-2 white1">${data.total_amount}</div></div>
                        <div class="" style="border-bottom: 0.5px solid white;"></div>
                    </div>
                    <div class="f-grid mb-2">
                        <div>
                            <label for="cashierid">Cashier ID:</label>
                            <input type="text" id="cashierid" name="cashierid" maxlength="4" placeholder="Cashier ID" required>
                        </div>
                        ${type === 'inpatient' ? `
                        <div>
                            <label for="status">Patient Status:</label>
                            <select id="status" name="status" required>
                                <option value="Discharged">Discharged</option>
                                <option value="Deceased">Deceased</option>
                            </select>
                        </div>` : ''}
                    </div>
                    <button class="btn nl-btn" id="payBillBtn" style="width: 100%;">Bill Paid</button>
                `;
                $("#billDetails").html(billDetailsHtml).show();

                $("#payBillBtn").on("click", function() {
                    const cashierid = $("#cashierid").val().trim();
                    if (cashierid === "") {
                        alert("Cashier ID cannot be empty");
                        return;
                    }
                    const patientStatus = type === 'inpatient' ? $("#status").val() : null;
                    payBill(patientid, data.total_amount, type, cashierid, patientStatus);
                });
            },
            error: function(jqXHR) {
                if (jqXHR.responseJSON && jqXHR.responseJSON.error) {
                    alert(jqXHR.responseJSON.error);
                } else {
                    alert('Error generating bill');
                }
                $("#billDetails").hide();
            }
        });
    }

    function payBill(patientid, amountPaid, type, cashierid, patientStatus) {
        const url = type === 'inpatient' ? `http://localhost:4000/pay_inpatient_bill` : `http://localhost:4000/pay_outpatient_bill`;
        const data = {
            patientid,
            amountPaid,
            cashierid,
            status: 'Paid',
            patientStatus
        };
        $.ajax({
            url: url,
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function() {
                alert('Bill Paid Successfully');
                $("#billDetails").hide();
            },
            error: function() {
                alert('Error paying bill');
            }
        });
    }
    
    // Close the dialog box when the close button is clicked
    $(document).on("click", "#close-dialog-btn", function() {
        $("#dialog-box").hide();
    });
    

});
