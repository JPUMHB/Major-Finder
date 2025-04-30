let interestScores = {};
let selectedSubjects = [];

function goToGrades() {
  interestScores = {};
  selectedSubjects = [];
  const form = document.forms['majorForm'];
  let tempScores = [];

  ['math', 'english', 'science', 'history'].forEach(subject => {
    const score = parseInt(form[subject].value);
    tempScores.push({ subject, score });
    if (score >= 3) {
      interestScores[subject] = score;
      selectedSubjects.push(subject);
    }
  });

    // If no subject is rated 3+, pick the one(s) with the highest score
    if (selectedSubjects.length === 0) {
        const maxScore = Math.max(...tempScores.map(s => s.score));
        tempScores.forEach(({ subject, score }) => {
          if (score === maxScore) {
            interestScores[subject] = score;
            selectedSubjects.push(subject);
          }
        });
      }

  const gradeDiv = document.getElementById('gradeInputs');
  gradeDiv.innerHTML = '';
  selectedSubjects.forEach(subject => {
    gradeDiv.innerHTML += `
      <label>${subject.charAt(0).toUpperCase() + subject.slice(1)} Grade:
        <select name="${subject}-grade" required>
          <option value=""disable selected>Select grade</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
          <option value="F">F</option>
        </select>
      </label><br>`;
  });

  document.getElementById('step1').classList.add('hidden');
  document.getElementById('step2').classList.remove('hidden');
}

function validateGrades() {
  const form = document.forms['majorForm'];
  let allGradesSelected = true;

  selectedSubjects.forEach(subject => {
    const grade = form[`${subject}-grade`].value;
    if (grade === "") {
      allGradesSelected = false;
    }
  });

  if (allGradesSelected) {
    goToHobbies();
  } else {
    alert("Please select a grade for each subject.");
  }
  
}
function goToHobbies() {
  const form = document.forms['majorForm'];
  selectedSubjects = selectedSubjects.filter(subject => {
    const grade = form[`${subject}-grade`].value.toUpperCase();
    return ['A', 'B'].includes(grade);
  });

  document.getElementById('step2').classList.add('hidden');
  document.getElementById('step3').classList.remove('hidden');
}


function goToCareers() {
  const form = document.forms['majorForm'];
  const hobbies = Array.from(form['hobbies']).filter(h => h.checked).map(h => h.value);
  if (hobbies.length === 0) {
    alert("Please select at least one hobby.");
    return; // Stop the function if no hobby is selected
  }
  fetch('majors.json')
    .then(response => response.json())
    .then(data => {
      const careers = new Set();
      hobbies.forEach(hobby => {
        (data.hobbyCareers[hobby] || []).forEach(career => careers.add(career));
      });

      const careerDiv = document.getElementById('careerChoices');
      careerDiv.innerHTML = '';
      [...careers].forEach(career => {
        careerDiv.innerHTML += `
          <label><input type="checkbox" name="careers" value="${career}"> ${career}</label><br>
        `;
      });
      limitCareerSelections();

      document.getElementById('step3').classList.add('hidden');
      document.getElementById('step4').classList.remove('hidden');
    });
}

function limitCareerSelections() {
    const checkboxes = document.querySelectorAll('input[name="careers"]');
  
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        const checked = Array.from(checkboxes).filter(cb => cb.checked);
  
        if (checked.length >= 3) {
          checkboxes.forEach(cb => {
            if (!cb.checked) cb.disabled = true;
          });
        } else {
          checkboxes.forEach(cb => cb.disabled = false);
        }
      });
    });
  }
  

  async function showMajors() {
        const form = document.forms['majorForm'];
        const selectedCareers = Array.from(form['careers'])
          .filter(c => c.checked)
          .map(c => c.value);
   
        const response = await fetch('majors.json');
        const database = await response.json();
   
        const suggestedMajors = new Map();
   
        // Step 1: Add majors based on career interest
        selectedCareers.forEach(career => {
          const majors = database.careerMajors[career] || [];
          majors.forEach(major => {
            if (!suggestedMajors.has(major)) {
              suggestedMajors.set(major, `Related to your interest in the career path of ${career}.`);
            }
          });
        });
   
        // Step 2: Add majors based on subjects they did well in (additional suggestions)
        selectedSubjects.forEach(subject => {
          const majors = database.keywords[subject] || [];
          majors.forEach(major => {
            if (!suggestedMajors.has(major)) {
              suggestedMajors.set(major, `Related to your great performance in ${subject}.`);
            }
          });
        });
   
        // Step 3: Display the final list
        const majorList = document.getElementById('majorList');
        majorList.innerHTML = '';
        suggestedMajors.forEach((reason, major) => {
          majorList.innerHTML += `<li><strong>${major}</strong>: ${reason}</li>`;
        });
   
        document.getElementById('majorForm').classList.add('hidden');
        document.getElementById('results').classList.remove('hidden');
      }
