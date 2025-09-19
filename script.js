document.addEventListener('DOMContentLoaded', () => {

    // --- Data Management Functions (using localStorage) ---
    function initLocalStorage() {
        if (!localStorage.getItem('users')) {
            localStorage.setItem('users', JSON.stringify([]));
        }
        if (!localStorage.getItem('jobs')) {
            localStorage.setItem('jobs', JSON.stringify([]));
        }
        if (!localStorage.getItem('applications')) {
            localStorage.setItem('applications', JSON.stringify([]));
        }
    }

    function getUsers() {
        return JSON.parse(localStorage.getItem('users')) || [];
    }
    
    function getJobs() {
        return JSON.parse(localStorage.getItem('jobs')) || [];
    }
    
    function getApplications() {
        return JSON.parse(localStorage.getItem('applications')) || [];
    }
    
    function saveUsers(users) {
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    function saveJobs(jobs) {
        localStorage.setItem('jobs', JSON.stringify(jobs));
    }

    function addApplication(application) {
        const applications = getApplications();
        applications.push(application);
        localStorage.setItem('applications', JSON.stringify(applications));
    }

    function subscribeUser(email, plan) {
        const users = getUsers();
        const userIndex = users.findIndex(u => u.email === email);
        if (userIndex > -1) {
            users[userIndex].subscription = plan;
            saveUsers(users);
            return true;
        }
        return false;
    }

    // --- UI Rendering Functions ---
    function renderJobs(jobs, containerId, userIsSubscriber = false) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';
    
        jobs.forEach(job => {
            const jobCard = document.createElement('div');
            jobCard.className = 'job-card';
            jobCard.innerHTML = `
                <h3>${job.title}</h3>
                <p><strong>Company:</strong> ${job.company}</p>
                <p><strong>Skills:</strong> ${job.skills.join(', ')}</p>
                <p><strong>Salary:</strong> ${job.salary}</p>
                <p><strong>Location:</strong> ${job.location}</p>
                <button class="apply-button" data-job-id="${job.id}" ${userIsSubscriber ? '' : 'disabled'}>Apply</button>
            `;
            container.appendChild(jobCard);
        });
    }

    function renderPostedJobs(employerEmail) {
        const jobs = getJobs();
        const employerJobs = jobs.filter(job => job.employerEmail === employerEmail);
        const container = document.getElementById('postedJobsList');
        if (!container) return;
        container.innerHTML = '';
        employerJobs.forEach(job => {
            const jobCard = document.createElement('div');
            jobCard.className = 'job-card';
            jobCard.innerHTML = `
                <h3>${job.title}</h3>
                <p>${job.company}</p>
            `;
            container.appendChild(jobCard);
        });
    }

    function renderAdminDashboard() {
        const users = getUsers();
        const jobs = getJobs();
        
        const totalJobSeekers = users.filter(u => u.role === 'jobSeeker').length;
        const totalEmployers = users.filter(u => u.role === 'employer').length;
        const activeSubscriptions = users.filter(u => u.subscription === 'paid').length;

        document.getElementById('totalJobSeekers').textContent = totalJobSeekers;
        document.getElementById('totalEmployers').textContent = totalEmployers;
        document.getElementById('totalPostedJobs').textContent = jobs.length;
        document.getElementById('activeSubscriptions').textContent = activeSubscriptions;
        
        const allJobsList = document.getElementById('allJobsList');
        allJobsList.innerHTML = jobs.map(job => `
            <div class="job-card">
                <h4>${job.title}</h4>
                <p>${job.company} - ${job.location}</p>
            </div>
        `).join('');

        const allUsersList = document.getElementById('allUsersList');
        allUsersList.innerHTML = users.map(user => `
            <div class="user-card job-card">
                <h4>${user.name || 'N/A'}</h4>
                <p>Email: ${user.email}</p>
                <p>Role: ${user.role || 'N/A'}</p>
                <p>Subscription: ${user.subscription || 'N/A'}</p>
            </div>
        `).join('');
    }

    // Renders services on the globe
    function renderServicesGlobe() {
        const services = ['Sales', 'Manufacturing', 'Hospitality & Management', 'IT & Tech', 'Marketing & Finance'];
        const globeContainer = document.getElementById('servicesGlobe');
        const colors = ['#f2c73d', '#4a6fa5', '#9a67ea', '#34c759', '#e85d04'];
        
        const radius = 150; 
        const totalServices = services.length;
        
        services.forEach((service, index) => {
            const angle = (360 / totalServices) * index;
            const x = radius * Math.cos(angle * Math.PI / 180) + radius;
            const y = radius * Math.sin(angle * Math.PI / 180) + radius;

            const serviceDiv = document.createElement('div');
            serviceDiv.className = 'service-item';
            serviceDiv.textContent = service;
            serviceDiv.style.left = `${x}px`;
            serviceDiv.style.top = `${y}px`;
            serviceDiv.style.backgroundColor = colors[index % colors.length];
            
            globeContainer.appendChild(serviceDiv);
        });
    }

    // --- Event Listeners and Main Logic ---

    // Function to switch between pages
    function showPage(pageId) {
        document.querySelectorAll('.page-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(pageId).classList.add('active');
    }

    // Navigation and CTA buttons
    document.querySelectorAll('.nav a, .cta-button').forEach(link => {
        link.addEventListener('click', (e) => {
            const pageId = e.target.getAttribute('data-page');
            if (pageId) {
                e.preventDefault();
                showPage(pageId);
                // Call render functions for the newly active page
                if (pageId === 'jobs') {
                    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                    if (currentUser) {
                        matchAndRenderJobs(currentUser.skills || []);
                    }
                } else if (pageId === 'employer') {
                    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                    if (currentUser) {
                        renderPostedJobs(currentUser.email);
                    }
                } else if (pageId === 'admin') {
                    renderAdminDashboard();
                }
            }
        });
    });

    // Theme toggle logic
    document.getElementById('themeToggleBtn').addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const icon = document.getElementById('themeToggleBtn').querySelector('i');
        if (document.body.classList.contains('dark-mode')) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    });

    // Dashboard 3-dots menu logic
    const adminMenuToggle = document.getElementById('adminMenuToggle');
    const adminDropdownMenu = document.getElementById('adminDropdownMenu');
    if (adminMenuToggle) {
        adminMenuToggle.addEventListener('click', () => {
            adminDropdownMenu.style.display = adminDropdownMenu.style.display === 'block' ? 'none' : 'block';
        });
    }
    
    // Hide dropdown menu when clicking outside
    window.addEventListener('click', (e) => {
        if (!e.target.matches('#adminMenuToggle') && adminDropdownMenu) {
            adminDropdownMenu.style.display = 'none';
        }
    });


    // Simulated Login/Register button logic
    document.getElementById('loginBtn').addEventListener('click', () => {
        const userEmail = prompt("Enter your email to log in or register:");
        if (userEmail) {
            let users = getUsers();
            let user = users.find(u => u.email === userEmail);
            if (!user) {
                user = { email: userEmail, role: 'jobSeeker', subscription: 'free' };
                users.push(user);
                saveUsers(users);
                alert("New user registered!");
            } else {
                alert("Welcome back!");
            }
            localStorage.setItem('currentUser', JSON.stringify(user));
        }
    });

    // Subscribe button logic
    document.getElementById('subscribeBtn').addEventListener('click', () => {
        const loggedInUser = JSON.parse(localStorage.getItem('currentUser'));
        if (loggedInUser) {
            alert('Payment successful! You are now a paid subscriber.');
            if (subscribeUser(loggedInUser.email, 'paid')) {
                alert('Subscription activated!');
            }
        } else {
            alert('Please log in to subscribe.');
        }
    });

    // Profile Form Logic
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const userData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                skills: document.getElementById('skills').value.split(',').map(s => s.trim()),
                education: document.getElementById('education').value,
            };
            const users = getUsers();
            const userIndex = users.findIndex(u => u.email === userData.email);
            if (userIndex > -1) {
                users[userIndex] = { ...users[userIndex], ...userData, role: 'jobSeeker' };
            } else {
                users.push({ ...userData, role: 'jobSeeker', subscription: 'free' });
            }
            saveUsers(users);
            localStorage.setItem('currentUser', JSON.stringify(users.find(u => u.email === userData.email)));
            alert('Profile saved!');
            matchAndRenderJobs(userData.skills);
        });

        const cvInput = document.getElementById('cvUpload');
        if (cvInput) {
            cvInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const fileDetails = {
                        name: file.name,
                        size: file.size,
                        lastModified: file.lastModified,
                    };
                    localStorage.setItem('uploadedCV', JSON.stringify(fileDetails));
                    alert('CV uploaded successfully!');
                }
            });
        }
    }

    function matchAndRenderJobs(userSkills) {
        const loggedInUser = JSON.parse(localStorage.getItem('currentUser'));
        const isPaidSubscriber = loggedInUser && loggedInUser.subscription === 'paid';
        const allJobs = getJobs();
        const recommendedJobs = allJobs.filter(job =>
            job.skills.some(skill => userSkills.includes(skill))
        );
        renderJobs(recommendedJobs, 'recommendedJobsList', isPaidSubscriber);
        
        const shortlistedJobs = allJobs.filter(job => 
            job.skills.every(skill => userSkills.includes(skill))
        );
        renderJobs(shortlistedJobs, 'shortlistedJobsList', isPaidSubscriber);
    }
    
    // Post Job Form Logic
    const postJobForm = document.getElementById('postJobForm');
    if (postJobForm) {
        postJobForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const jobData = {
                id: Date.now(),
                title: document.getElementById('jobTitle').value,
                company: document.getElementById('companyName').value,
                description: document.getElementById('jobDescription').value,
                skills: document.getElementById('skillsRequired').value.split(',').map(s => s.trim()),
                salary: document.getElementById('salary').value,
                location: document.getElementById('location').value,
                employerEmail: JSON.parse(localStorage.getItem('currentUser')).email
            };
            const jobs = getJobs();
            jobs.push(jobData);
            saveJobs(jobs);
            alert('Job posted successfully!');
            renderPostedJobs(jobData.employerEmail);
        });
    }

    // Apply button logic
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('apply-button')) {
            const jobId = e.target.getAttribute('data-job-id');
            const loggedInUser = JSON.parse(localStorage.getItem('currentUser'));
            if (loggedInUser && loggedInUser.subscription === 'paid') {
                addApplication({ jobId: jobId, applicantEmail: loggedInUser.email });
                alert('Application submitted successfully!');
            } else {
                alert('You must be a paid subscriber to apply for jobs.');
            }
        }
    });

    // Initialize the website on page load
    initLocalStorage();
    showPage('home'); 
    renderServicesGlobe();
});