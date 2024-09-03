let students = [];

document.getElementById('studentsFile').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file && (file.name.endsWith('.csv') || file.name.endsWith('.xlsx'))) { // Check for CSV and Excel files
        const reader = new FileReader();
        reader.onload = function(e) {
            const data = e.target.result;
            if (file.name.endsWith('.csv')) {
                students = data.trim().split('\n').slice(1).map(line => line.split(',')); // Skip header for CSV
            } else if (file.name.endsWith('.xlsx')) {
                const workbook = XLSX.read(data, { type: 'binary' });
                students = [];
                workbook.SheetNames.forEach(sheetName => {
                    const sheet = workbook.Sheets[sheetName];
                    students.push(...XLSX.utils.sheet_to_json(sheet, { header: 1 }).slice(1)); // Skip header for each sheet
                });
            }
            const numStudents = students.length;
            const studentsPerRoom = 40;
            const numRooms = Math.ceil(numStudents / studentsPerRoom);
            document.getElementById('roomsRequired').textContent = `Number of rooms required: ${numRooms}`;
        };
        reader.readAsBinaryString(file);
    } else {
        alert('Please upload a valid CSV or Excel file.');
    }
});

document.getElementById('uploadForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const formData = new FormData();
    const fileInput = document.getElementById('studentsFile');
    const selectedRooms = Array.from(document.querySelectorAll('.room-item input[type="checkbox"]:checked')).map(checkbox => checkbox.value);
    if (fileInput.files.length > 0 && selectedRooms.length > 0) {
        formData.append(fileInput.name, fileInput.files[0]);
        formData.append('selectedRooms', selectedRooms.join(','));
        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });
            if (response.ok) {
                alert('File uploaded and processed successfully');
            } else {
                alert('Failed to upload file');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Error uploading file');
        }
    } else {
        alert('Please choose a file to upload and select at least one room.');
    }
});

document.getElementById('downloadBtn').addEventListener('click', function() {
    window.location.href = '/download';
});
