let apiUrl = 'https://api.recruitcrm.io/v1/jobs/search';
const apiToken = '7ph7atKWpBgK5rQQDbd1alptL2UiQ1vusYTB8hb8B6UP7bLKmb2qt3HRjScQa9nunJuI5cdhpqU0kyVrzHm5TF8xNjk3MDMyNDU2';

async function renderDetailedJob(jobId) {
    showLoadingSpinner();
    try {
        
        const detailedJob = await getDetailedJobInfo(jobId);
        console.log(detailedJob[0].name);
       
        document.getElementById('jobTitle').innerText = detailedJob[0].name;
        document.getElementById('jobCategory').innerText = detailedJob[0].job_category;
        document.getElementById('jobCountry').innerText = detailedJob[0].country;
        document.getElementById('jobCity').innerText = detailedJob[0].city;

        
        const jobDescriptionContainer = document.getElementById('job-description');
        jobDescriptionContainer.innerHTML = `
            <h2>Job Description:</h2>
            <p>${detailedJob[0].job_description_text}</p>
            
        `;
    } catch (error) {
        console.error('Error fetching detailed job information:', error);
    }
    finally{
        hideLoadingSpinner();
    }
    
}
const loadingSpinner = document.getElementById('loadingSpinner');
function showLoadingSpinner() {
    loadingSpinner.style.display = 'block';
}

function hideLoadingSpinner() {
    loadingSpinner.style.display = 'none';
}

async function norenderJob(jobId) {
    const apiUrl = `https://api.recruitcrm.io/v1/jobs/search?job_slug=${jobId}`;

    try {
        showLoadingSpinner();
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + apiToken,
                'Content-Type': 'application/json'

            },

        });

        if (!response.ok) {
            throw new Error('Failed to fetch detailed job information');
        }

        const data = await response.json();
        console.log('Detailed Job Info:', data);

        return data.data;
    } catch (error) {
        console.error('Error fetching detailed job information:', error);
        throw error;
    }
    finally{
        hideLoadingSpinner();
    }
}
window.onload=norenderJob();
const urlParams = new URLSearchParams(window.location.search);


const jobId = urlParams.get('job_slug');


console.log('Job ID:', jobId);
renderDetailedJob(jobId);




async function getDetailedJobInfo(jobId) {
    const apiUrl = `https://api.recruitcrm.io/v1/jobs/search?job_slug=${jobId}`;
    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + apiToken,
                'Content-Type': 'application/json'

            },

        });

        if (!response.ok) {
            throw new Error('Failed to fetch detailed job information');
        }

        const data = await response.json();
        console.log('Detailed Job Info:', data);

        return data.data;
    } catch (error) {
        console.error('Error fetching detailed job information:', error);
        throw error;
    }
}
function scrollToApplyForm() {

    var applyForm = document.getElementById('applicationFormContainer');


    applyForm.scrollIntoView({ behavior: 'smooth' });
}


function validateJobApplicationForm(data) {
    const firstName = data.get("firstName").trim();
    const lastName = data.get("lastName").trim();
    const email = data.get("email").trim();
    const phoneNumber = data.get("phoneNumber").trim();
    const city = data.get("city").trim();
    const resumeInput = data.get("resume");
    console.log(resumeInput);
    if ((firstName === '' && lastName === '') || email === '' || phoneNumber === '' || city === '' || resumeInput.name === '') {
        alert('All fields are required');
        return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Invalid email format');
        return false;
    }
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
        alert('Invalid phone number format');
        return false;
    }

    if (!resumeInput) {
        alert('Please upload your resume');
        return false;
    }


    return true;
}

async function submitDetailedJobApplication(e) {
    e.disabled=true;
    console.log(e.disabled);
    const formData = new FormData(document.getElementById('abcdc'));
    const isFormValid = validateJobApplicationForm(formData);
    console.log(formData.get("firstName"));
    console.log(formData);
    if (isFormValid) {
        try {

            const candidateProfileId = await createCandidateProfile(formData);
            console.log(candidateProfileId);


            const applyJobResponse = await applyToJob(jobId, candidateProfileId);
            console.log(applyJobResponse);
            console.log(typeof (applyJobResponse.status.label));

            if (applyJobResponse.status.label) {
                alert('Application submitted successfully!');
            } else {
                console.error('Failed to apply for the job. Response:', applyJobResponse);

            }


        } catch (error) {
            console.error('Error submitting job application:', error);

        }
    }
    e.disabled=false;
}

async function createCandidateProfile(formData) {
    const createProfileEndpoint = 'https://api.recruitcrm.io/v1/candidates';
    const newformData = new FormData();
    const fileInput = document.getElementById("resume");
    console.log(fileInput);
    console.log(fileInput.files[0]);
    newformData.append("first_name", formData.get("firstName"));
    newformData.append("last_name", formData.get("lastName"));
    newformData.append("email", formData.get("email"));
    newformData.append("city", formData.get("city"));
    newformData.append("contact_number", formData.get("phoneNumber"));
    newformData.append("resume", fileInput.files[0]);
    console.log(newformData);
    for (const entry of newformData.entries()) {
        console.log(entry[0], entry[1]);
    }

    try {
        const response = await fetch(createProfileEndpoint, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + apiToken,
            },
            body: newformData
        });
        const data = await response.json();
        console.log('Candidate Profile Created:', data);

        return data.slug;
    } catch (error) {
        console.error('Error creating candidate profile:', error);
        throw error;
    }
}

async function applyToJob(jobId, candidateProfileId) {
    const applyToJobEndpoint = `https://api.recruitcrm.io/v1/candidates/${candidateProfileId}/apply?job_slug=${jobId}`;
    try {
        const response = await fetch(applyToJobEndpoint, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + apiToken,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        console.log('Applied to Job:', data);
        return data;
    } catch (error) {
        console.error('Error applying to job:', error);
        throw error;
    }
}