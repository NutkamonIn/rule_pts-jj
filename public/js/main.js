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

            // แสดงกลุ่มที่แนะนำ
            suggestedGroupEl.textContent = data.suggestedGroup || 'N/A';
            
            // แสดงเรทเงิน
            const salaryAmountEl = document.getElementById('salaryAmount');
            const matchedRulesCountEl = document.getElementById('matchedRulesCount');
            
            // คำนวณเรทเงินจากกฎที่ตรงกัน
            let totalAmount = 0;
            if (data.matchedRuleDetails && data.matchedRuleDetails.length > 0) {
                // หาเรทเงินสูงสุดจากกฎที่ตรงกัน
                totalAmount = Math.max(...data.matchedRuleDetails.map(rule => rule.amount || 0));
            }
            
            salaryAmountEl.textContent = totalAmount > 0 ? `${totalAmount.toLocaleString()} บาท` : 'ไม่ระบุ';
            matchedRulesCountEl.textContent = data.matchedRules ? data.matchedRules.length : 0;

            // แสดงข้อมูลโปรไฟล์ที่ส่งมา
            document.getElementById('profileJobTitle').textContent = profile.jobTitle || '-';
            document.getElementById('profileDepartment').textContent = profile.department || '-';
            document.getElementById('profileDegree').textContent = profile.degree || '-';
            document.getElementById('profileSpecialty').textContent = profile.specialty || '-';
            document.getElementById('profileSpecialCommand').textContent = profile.hasSpecialCommand ? 'มี' : 'ไม่มี';
            
            // แสดงกฎที่ตรงกัน
            if (data.matchedRules && data.matchedRules.length > 0) {
                data.matchedRules.forEach(rule => {
                    const li = document.createElement('li');
                    li.textContent = rule;
                    matchedRulesEl.appendChild(li);
                });
            } else {
                const li = document.createElement('li');
                li.textContent = 'ไม่มีกฎที่ตรงกัน';
                matchedRulesEl.appendChild(li);
            }
            
            // แสดงความคิดเห็น
            if (Array.isArray(data.comments)) {
                commentsEl.textContent = data.comments.join(', ');
            } else {
                commentsEl.textContent = data.comments || 'ไม่มีความคิดเห็น';
            }

            // Show matchedRuleDetails
            const ruleDetailsDiv = document.getElementById('matchedRuleDetails');
            if (ruleDetailsDiv) {
                ruleDetailsDiv.innerHTML = ''; // Clear previous
                if (data.matchedRuleDetails && data.matchedRuleDetails.length > 0) {
                    data.matchedRuleDetails.forEach((rule, index) => {
                        const el = document.createElement('div');
                        el.className = "p-4 bg-slate-50 border border-slate-300 rounded mb-3";
                        
                        // สร้างรายการเงื่อนไข
                        let conditionsHtml = '';
                        if (rule.conditions && rule.conditions.length > 0) {
                            conditionsHtml = rule.conditions.map(condition => {
                                const value = Array.isArray(condition.equals) 
                                    ? condition.equals.join(', ') 
                                    : condition.equals;
                                return `<li><strong>${condition.field}:</strong> ${value}</li>`;
                            }).join('');
                        }
                        
                        el.innerHTML = `
                            <div class="flex justify-between items-start mb-2">
                                <h4 class="font-semibold text-gray-800">กฎ ${rule.id}</h4>
                                <span class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                                    ${rule.amount ? rule.amount.toLocaleString() + ' บาท' : 'ไม่ระบุเงิน'}
                                </span>
                            </div>
                            <p class="text-sm text-gray-600 mb-2"><strong>กลุ่ม:</strong> ${rule.group}</p>
                            <div class="text-sm">
                                <p class="font-medium text-gray-700 mb-1">เงื่อนไข:</p>
                                <ul class="list-disc list-inside text-gray-600 pl-2">
                                    ${conditionsHtml}
                                </ul>
                            </div>
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
