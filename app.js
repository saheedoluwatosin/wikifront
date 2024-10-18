// app.js
document.addEventListener('DOMContentLoaded', () => {
    const createGuideBtn = document.getElementById('createGuideBtn');
    const viewGuidesBtn = document.getElementById('viewGuidesBtn');
    const createGuideForm = document.getElementById('createGuideForm');
    const guidesList = document.getElementById('guidesList');
    const mainContent = document.getElementById('mainContent');
    const guideForm = document.getElementById('guideForm');
    const addStepBtn = document.getElementById('addStepBtn');
    const stepsContainer = document.getElementById('steps');
    const guidesContainer = document.getElementById('guidesContainer');

    let stepCount = 0;

    createGuideBtn.addEventListener('click', () => {
        createGuideForm.classList.remove('hidden');
        guidesList.classList.add('hidden');
        mainContent.innerHTML = '';
    });

    viewGuidesBtn.addEventListener('click', fetchGuides);

    addStepBtn.addEventListener('click', addStep);

    guideForm.addEventListener('submit', submitGuide);

    function addStep() {
        stepCount++;
        const stepDiv = document.createElement('div');
        stepDiv.classList.add('step');
        stepDiv.innerHTML = `
            <h3>Step ${stepCount}</h3>
            <input type="text" name="stepTitle${stepCount}" placeholder="Step Title" required>
            <textarea name="stepDescription${stepCount}" placeholder="Step Description" required></textarea>
            <button type="button" class="uploadBtn">Upload Image</button>
            <input type="hidden" name="stepImage${stepCount}">
        `;
        stepsContainer.appendChild(stepDiv);

        const uploadBtn = stepDiv.querySelector('.uploadBtn');
        const imageInput = stepDiv.querySelector(`input[name="stepImage${stepCount}"]`);

        uploadBtn.addEventListener('click', () => {
            const myWidget = cloudinary.createUploadWidget(
                {
                    cloudName: 'dvdnkkvjt',
                    uploadPreset: 'ml_default'
                },
                (error, result) => {
                    if (!error && result && result.event === "success") {
                        imageInput.value = result.info.secure_url;
                        uploadBtn.textContent = 'Image Uploaded';
                        uploadBtn.disabled = true;
                    }
                }
            );
            myWidget.open();
        });
    }

    async function submitGuide(e) {
        e.preventDefault();
        const formData = new FormData(guideForm);
        const guideData = {
            title: formData.get('title'),
            description: formData.get('description'),
            steps: []
        };

        for (let i = 1; i <= stepCount; i++) {
            guideData.steps.push({
                title: formData.get(`stepTitle${i}`),
                description: formData.get(`stepDescription${i}`),
                image: formData.get(`stepImage${i}`)
            });
        }

        try {
            const response = await fetch('https://wiki-6whr.onrender.com/api/guides', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(guideData),
            });

            if (response.ok) {
                alert('Guide created successfully!');
                guideForm.reset();
                stepsContainer.innerHTML = '';
                stepCount = 0;
            } else {
                alert('Failed to create guide');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while creating the guide');
        }
    }

    async function fetchGuides() {
        try {
            const response = await fetch('https://wiki-6whr.onrender.com/api/guides');
            const guides = await response.json();
            displayGuides(guides);
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while fetching guides');
        }
    }

    function displayGuides(guides) {
        createGuideForm.classList.add('hidden');
        guidesList.classList.remove('hidden');
        mainContent.innerHTML = '';

        guidesContainer.innerHTML = '';
        guides.forEach(guide => {
            const guideElement = document.createElement('li');
            guideElement.classList.add('guide');
            guideElement.innerHTML = `
                <h3>${guide.title}</h3>
                <p>${guide.description}</p>
                <button class="viewGuideBtn" data-id="${guide._id}">View Guide</button>
            `;
            guidesContainer.appendChild(guideElement);
        });

        document.querySelectorAll('.viewGuideBtn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const guideId = e.target.getAttribute('data-id');
                fetchGuideDetails(guideId);
            });
        });
    }

    async function fetchGuideDetails(guideId) {
        try {
            const response = await fetch(`https://wiki-6whr.onrender.com/api/guides/${guideId}`);
            const guide = await response.json();
            displayGuideDetails(guide);
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while fetching guide details');
        }
    }

    function displayGuideDetails(guide) {
        createGuideForm.classList.add('hidden');
        guidesList.classList.add('hidden');
        mainContent.innerHTML = `
            <h2>${guide.title}</h2>
            <p>${guide.description}</p>
            ${guide.steps.map((step, index) => `
                <div class="step">
                    <h3>Step ${index + 1}: ${step.title}</h3>
                    <p>${step.description}</p>
                    ${step.image ? `<img src="${step.image}" alt="Step ${index + 1}">` : ''}
                </div>
            `).join('')}
        `;
    }
});