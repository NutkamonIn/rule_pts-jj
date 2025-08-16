document.addEventListener('DOMContentLoaded', () => {
    const profileForm = document.getElementById('profileForm');
    const submitButton = profileForm.querySelector('button[type="submit"]');
    const resultsDiv = document.getElementById('results');
    const suggestedGroupEl = document.getElementById('suggestedGroup');
    const matchedRulesEl = document.getElementById('matchedRules');
    const commentsEl = document.getElementById('comments');
    const errorDisplayEl = document.getElementById('errorDisplay');

    profileForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Clear previous results and errors
        resultsDiv.classList.add('hidden');
        if (errorDisplayEl) errorDisplayEl.classList.add('hidden');
        if (errorDisplayEl) errorDisplayEl.textContent = '';
        suggestedGroupEl.textContent = '';
        matchedRulesEl.innerHTML = '';
        commentsEl.textContent = '';

        // Set loading state
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Classifying...';

        const formData = new FormData(profileForm);
        const profile = {
            jobTitle: formData.get('jobTitle'),
            department: formData.get('department'),
            degree: formData.get('degree'),
            specialty: formData.get('specialty'),
            hasSpecialCommand: formData.get('hasSpecialCommand') === 'on'
        };

        try {
            const response = await fetch('/classify-position', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(profile) // Corrected payload
            });

            if (!response.ok) {
                let errorMsg = `API Error: ${response.status} ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.message || errorData.error || errorMsg;
                } catch (e) {
                    // Failed to parse JSON error, use status text
                }
                throw new Error(errorMsg);
            }

            const data = await response.json();

            suggestedGroupEl.textContent = data.suggestedGroup || 'N/A';
            
            if (data.matchedRules && data.matchedRules.length > 0) {
                data.matchedRules.forEach(rule => {
                    const li = document.createElement('li');
                    li.textContent = rule;
                    matchedRulesEl.appendChild(li);
                });
            } else {
                const li = document.createElement('li');
                li.textContent = 'No specific rules matched.';
                matchedRulesEl.appendChild(li);
            }
            
            commentsEl.textContent = data.comments || 'No comments.';

            // Show matchedRuleDetails
            const ruleDetailsDiv = document.getElementById('matchedRuleDetails');
            if (ruleDetailsDiv) {
                ruleDetailsDiv.innerHTML = ''; // Clear previous
                if (data.matchedRuleDetails && data.matchedRuleDetails.length > 0) {
                    data.matchedRuleDetails.forEach((rule, index) => {
                        const el = document.createElement('div');
                        el.className = "p-2 bg-slate-50 border border-slate-300 rounded";
                        el.innerHTML = `
                            <p><strong>Rule ${index + 1}</strong></p>
                            <p><strong>Group:</strong> ${rule.group}</p>
                            <p><strong>Conditions:</strong></p>
                            <pre class="text-xs whitespace-pre-wrap">${JSON.stringify(rule.conditions, null, 2)}</pre>
                        `;
                        ruleDetailsDiv.appendChild(el);
                    });
                } else {
                    ruleDetailsDiv.innerHTML = '<p class="text-red-500 italic">No matched rule details.</p>';
                }
            }
            
            resultsDiv.classList.remove('hidden');

        } catch (error) {
            console.error('Error classifying position:', error);
            if (errorDisplayEl) {
                errorDisplayEl.textContent = error.message;
                errorDisplayEl.classList.remove('hidden');
            } else {
                alert(`Error: ${error.message}`); // Fallback if errorDisplayEl is not in HTML yet
            }
            resultsDiv.classList.add('hidden');
        } finally {
            // Reset loading state
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    });
});
