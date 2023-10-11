let allLoans = []
let activeLoans = []


// Function to format a date string to a simpler format
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Function to fetch all loans using Axios
function getAllLoans() {
    axios.get('/loans')
        .then(function (response) {
            allLoans = response.data.loans; // Assign the fetched loans to the allLoans variable
            // Display the relevant search button
            searchButton.innerHTML = '<button style="margin-left: 85px;" onclick="search(allLoans)">Search</button><button onclick="getAllLoans()">Cancel</button>'
            // Set the side bar active item color
            b.style.backgroundColor = '#04AA6D'
            c.style.backgroundColor = '#04AA6D'
            a.style.backgroundColor = '#333'
            // Display all loans initially
            displayLoans(allLoans);
        })
        .catch(function (error) {
            console.error('Error fetching loans:', error);
        });
}

// Attach event listeners
document.addEventListener('DOMContentLoaded', function () {
    getAllLoans();
})

// Function to create table headers
function createTableHeaders() {
    const tableHeader = document.createElement('thead');
    tableHeader.innerHTML = `
        <tr>
            <th>Book</th>
            <th>Customer</th>
            <th>Loan date</th>
            <th>Latest date to return</th>
            <th>Return date</th>
        </tr>
    `;
    loansTable.appendChild(tableHeader);
}

// Call createTableHeaders once when the page loads
document.addEventListener('DOMContentLoaded', createTableHeaders);

// Display the table body
function displayLoans(loans) {
    const tableBody = document.createElement('tbody');

    // Remove existing rows from the table
    const existingTableBody = loansTable.getElementsByTagName('tbody')[0];
    if (existingTableBody) existingTableBody.remove();

    // Use forEach loop to display loans
    loans.forEach(function (loan) {
        // Check if book was returned and there's a returnDate, else return: "-"
        const ReturnDate = loan.ReturnDate ? formatDate(loan.ReturnDate) : "-";
        const row = document.createElement('tr');
        row.innerHTML = `
        <td>${loan.bookTitle}</td>
        <td>${loan.customerName}</td>
        <td>${formatDate(loan.loanDate)}</td>
        <td>${formatDate(loan.MaxReturnDate)}</td>
        <td>${ReturnDate}</td>
        <td>
            ${loan.ReturnDate ? '' : `<button onclick="returnBook(${loan.loanID})">Return book</button>`}
        </td>
    `;
        tableBody.appendChild(row);
    });

    document.getElementById('loansTable').appendChild(tableBody);
}

// Function to display active loans only
function displayActiveLoans() {
    // Filter loans with no returnDate to get active loans
    activeLoans = allLoans.filter(function (loan) {
        return !loan.ReturnDate;
    });
    // Check if there are no active loans, and tostify it, else - display active loans
    if (activeLoans.length === 0) showSuccessNotification("There are no active loans.")
    else{
        // Display the relevant search button
        searchButton.innerHTML = '<button style="margin-left: 85px;" onclick="search(activeLoans)">Search</button><button onclick="displayActiveLoans()">Cancel</button>'
        // Set the side bar active item color
        a.style.backgroundColor = '#04AA6D'
        c.style.backgroundColor = '#04AA6D'
        b.style.backgroundColor = '#333'
    
        displayLoans(activeLoans);
    }
}

// Display loans where the book hasn't been returned even though the maxReturnDate passed
function displayLateLoans() {
    axios.get('/loans/late')
        .then(function (response) {
            lateLoans = response.data.late_loans;

            // Use the ternary operator to conditionally show a notification or display loans
            if(lateLoans.length === 0) showSuccessNotification("There are no late loans.")
            else{
                // Set the side bar active item color
                b.style.backgroundColor = '#04AA6D'
                a.style.backgroundColor = '#04AA6D'
                c.style.backgroundColor = '#333'
                displayLoans(lateLoans);
            }
        })
        .catch(function (error) {
            console.error('Error fetching late loans:', error);
            showErrorNotification("Error fetching late loans.");
        });
}

// Ruturn book and end the loan
function returnBook(loanID) {
    // Ask for confirmation from the user
    const userConfirmed = confirm("Are you sure you want to return this book?");

    if (userConfirmed) {
        // Send a PUT request to the /loans/<loan_id> endpoint to end the loan
        axios.put(`/loans/${loanID}`)
            .then(function (response) {
                // Check if the request was successful
                if (response.data.message === 'Loan ended successfully') {
                    // Display a success notification
                    showSuccessNotification('Book returned successfully');

                    // Reload display active loans after ending the loan
                    getAllLoans();
                }
            })
            .catch(function (error) {
                console.error('Error returning book:', error);
                showErrorNotification('Error returning book');
            });
    } else {
        // The user canceled the action, do nothing or provide feedback
        console.log('Book return action canceled by the user');
    }
}

// Search a specific loan (by book title), using "filter"
function search(loans){
    const search_input = searchInput.value.toLowerCase();
    const filterLoans = loans.filter(function(loan){
        return loan.bookTitle.toLowerCase().includes(search_input)
    });
    displayLoans(filterLoans)
}

// Function to display a success notification using Toastify
function showSuccessNotification(message) {
    Toastify({
        text: message,
        duration: 3000, // Notification will disappear after 3 seconds
        gravity: 'top', // Position it at the top of the screen
        position: 'center', // Position it horizontally in the center
        backgroundColor: '#04AA6D', // Background color for success
    }).showToast();
}

// Function to display an error notification using Toastify
function showErrorNotification(message) {
    Toastify({
        text: message,
        duration: 3000, // Notification will disappear after 3 seconds
        gravity: 'top', // Position it at the top of the screen
        position: 'center', // Position it horizontally in the center
        backgroundColor: 'red', // Background color for errors
    }).showToast();
}