const resultsHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Survey Results - Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 40px 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
        }

        .header {
            background: white;
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        h1 {
            color: #333;
            font-size: 32px;
            margin-bottom: 10px;
        }

        .stats {
            display: flex;
            gap: 20px;
            margin-top: 20px;
            flex-wrap: wrap;
        }

        .stat-card {
            flex: 1;
            min-width: 200px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
        }

        .stat-value {
            font-size: 36px;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .stat-label {
            font-size: 14px;
            opacity: 0.9;
        }

        .last-updated {
            color: #666;
            font-size: 14px;
            margin-top: 10px;
        }

        .loading {
            text-align: center;
            color: #666;
            padding: 40px;
        }

        .question-results {
            background: white;
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 20px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .question-title {
            color: #333;
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 20px;
        }

        .option-row {
            margin-bottom: 15px;
        }

        .option-label {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            color: #666;
            font-size: 14px;
        }

        .option-count {
            font-weight: 600;
            color: #667eea;
        }

        .bar-container {
            background: #f0f0f0;
            border-radius: 10px;
            height: 30px;
            overflow: hidden;
            position: relative;
        }

        .bar-fill {
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            height: 100%;
            transition: width 0.5s ease;
            display: flex;
            align-items: center;
            padding: 0 15px;
            color: white;
            font-size: 14px;
            font-weight: 600;
        }

        .bar-fill.low {
            background: linear-gradient(90deg, #e0e0e0 0%, #c0c0c0 100%);
            color: #666;
        }

        .refresh-indicator {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            padding: 10px 20px;
            border-radius: 20px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            font-size: 14px;
            color: #666;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .refresh-dot {
            width: 8px;
            height: 8px;
            background: #28a745;
            border-radius: 50%;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
        }

        .no-data {
            text-align: center;
            padding: 60px 20px;
            color: #999;
        }

        .no-data h2 {
            font-size: 24px;
            margin-bottom: 10px;
        }

        .error {
            background: #ff4444;
            color: white;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
        }

        .back-link {
            display: inline-block;
            margin-top: 10px;
            color: #667eea;
            text-decoration: none;
            font-weight: 600;
        }

        .back-link:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="refresh-indicator">
        <div class="refresh-dot"></div>
        <span id="refreshStatus">Auto-refreshing...</span>
    </div>

    <div class="container">
        <div class="header">
            <h1>📊 Survey Results Dashboard</h1>
            <a href="/" class="back-link">← Back to Survey</a>
            <div class="stats">
                <div class="stat-card">
                    <div class="stat-value" id="totalResponses">0</div>
                    <div class="stat-label">Total Responses</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="uniqueDevices">0</div>
                    <div class="stat-label">Unique Devices</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="completionRate">0%</div>
                    <div class="stat-label">Completion Rate</div>
                </div>
            </div>
            <div class="last-updated">Last updated: <span id="lastUpdated">Never</span></div>
        </div>

        <div id="error"></div>
        <div id="loading" class="loading">Loading results...</div>
        <div id="results"></div>
    </div>

    <script>
        let pollInterval;
        let lastFetchTime = null;

        async function fetchResults() {
            try {
                const response = await fetch('/api/results');
                if (!response.ok) {
                    throw new Error('Failed to fetch results');
                }
                
                const data = await response.json();
                displayResults(data);
                
                lastFetchTime = new Date();
                document.getElementById('lastUpdated').textContent = lastFetchTime.toLocaleTimeString();
                document.getElementById('error').innerHTML = '';
                document.getElementById('loading').style.display = 'none';
                
            } catch (error) {
                console.error('Error fetching results:', error);
                document.getElementById('error').innerHTML = \`
                    <div class="error">
                        Error loading results: \${error.message}
                    </div>
                \`;
                document.getElementById('loading').style.display = 'none';
            }
        }

        function displayResults(data) {
            // Update stats
            document.getElementById('totalResponses').textContent = data.stats.totalResponses || 0;
            document.getElementById('uniqueDevices').textContent = data.stats.uniqueDevices || 0;
            
            const completionRate = data.stats.expectedResponses > 0 
                ? Math.round((data.stats.totalResponses / data.stats.expectedResponses) * 100)
                : 0;
            document.getElementById('completionRate').textContent = completionRate + '%';

            // Display question results
            const resultsContainer = document.getElementById('results');
            
            if (!data.questions || data.questions.length === 0) {
                resultsContainer.innerHTML = \`
                    <div class="question-results">
                        <div class="no-data">
                            <h2>No survey responses yet</h2>
                            <p>Results will appear here as users complete the survey.</p>
                        </div>
                    </div>
                \`;
                return;
            }

            resultsContainer.innerHTML = data.questions.map(question => {
                const total = question.options.reduce((sum, opt) => sum + opt.count, 0);
                
                return \`
                    <div class="question-results">
                        <div class="question-title">\${question.questionText}</div>
                        \${question.options.map(option => {
                            const percentage = total > 0 ? Math.round((option.count / total) * 100) : 0;
                            const barClass = percentage < 10 ? 'bar-fill low' : 'bar-fill';
                            
                            return \`
                                <div class="option-row">
                                    <div class="option-label">
                                        <span>\${option.answerText}</span>
                                        <span class="option-count">\${option.count} \${option.count === 1 ? 'response' : 'responses'}</span>
                                    </div>
                                    <div class="bar-container">
                                        <div class="\${barClass}" style="width: \${percentage}%">
                                            \${percentage > 0 ? percentage + '%' : ''}
                                        </div>
                                    </div>
                                </div>
                            \`;
                        }).join('')}
                    </div>
                \`;
            }).join('');
        }

        function startPolling() {
            // Fetch immediately
            fetchResults();
            
            // Then poll every 10 seconds
            pollInterval = setInterval(() => {
                fetchResults();
                document.getElementById('refreshStatus').textContent = 'Refreshed at ' + new Date().toLocaleTimeString();
            }, 10000);
        }

        function stopPolling() {
            if (pollInterval) {
                clearInterval(pollInterval);
            }
        }

        // Start polling when page loads
        window.addEventListener('load', startPolling);
        
        // Stop polling when page is hidden (battery/performance optimization)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                stopPolling();
            } else {
                startPolling();
            }
        });

        // Clean up on page unload
        window.addEventListener('beforeunload', stopPolling);
    </script>
</body>
</html>
`;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simple Survey</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }

        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 600px;
            width: 100%;
            padding: 40px;
        }

        .progress-bar {
            width: 100%;
            height: 8px;
            background: #e0e0e0;
            border-radius: 10px;
            margin-bottom: 30px;
            overflow: hidden;
        }

        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            transition: width 0.3s ease;
        }

        .question-number {
            color: #667eea;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 10px;
        }

        h1 {
            color: #333;
            font-size: 24px;
            margin-bottom: 30px;
            line-height: 1.4;
        }

        .options {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-bottom: 30px;
        }

        .option {
            background: #f8f9fa;
            border: 2px solid #e0e0e0;
            border-radius: 12px;
            padding: 18px 20px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 16px;
        }

        .option:hover {
            border-color: #667eea;
            background: #f0f4ff;
        }

        .option.selected {
            border-color: #667eea;
            background: #667eea;
            color: white;
        }

        .buttons {
            display: flex;
            justify-content: space-between;
            gap: 12px;
        }

        button {
            padding: 14px 28px;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .btn-back {
            background: #e0e0e0;
            color: #333;
        }

        .btn-back:hover {
            background: #d0d0d0;
        }

        .btn-back:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .btn-next, .btn-submit {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            flex: 1;
        }

        .btn-next:hover, .btn-submit:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .btn-next:disabled, .btn-submit:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
        }

        .results {
            text-align: center;
        }

        .results h2 {
            color: #667eea;
            font-size: 32px;
            margin-bottom: 20px;
        }

        .results p {
            color: #666;
            font-size: 18px;
            margin-bottom: 30px;
        }

        .result-item {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 15px;
            text-align: left;
        }

        .result-question {
            color: #333;
            font-weight: 600;
            margin-bottom: 8px;
        }

        .result-answer {
            color: #667eea;
            font-size: 16px;
        }

        .hidden {
            display: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div id="survey" class="survey">
            <div class="progress-bar">
                <div class="progress-fill" id="progress"></div>
            </div>
            
            <div class="question-number" id="questionNumber"></div>
            <h1 id="questionText"></h1>
            
            <div class="options" id="options"></div>
            
            <div class="buttons">
                <button class="btn-back" id="backBtn" onclick="previousQuestion()">Back</button>
                <button class="btn-next" id="nextBtn" onclick="nextQuestion()" disabled>Next</button>
                <button class="btn-submit hidden" id="submitBtn" onclick="submitSurvey()">Submit</button>
            </div>
        </div>

        <div id="results" class="results hidden">
            <h2>🎉 Survey Complete!</h2>
            <p>Thank you for completing the survey. Here are your responses:</p>
            <div id="resultsList"></div>
            <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
                <button class="btn-next" onclick="window.location.href='/results'">📊 View All Results</button>
                <button class="btn-back" onclick="restartSurvey()">Start Over</button>
            </div>
        </div>
    </div>

    <script>
        const questions = [
            {
                question: "What is your favorite type of music?",
                options: ["Rock", "Pop", "Jazz", "Classical", "Hip Hop", "Electronic"]
            },
            {
                question: "How often do you exercise?",
                options: ["Daily", "3-4 times a week", "1-2 times a week", "Rarely", "Never"]
            },
            {
                question: "What's your preferred way to relax?",
                options: ["Reading", "Watching TV/Movies", "Playing video games", "Outdoor activities", "Meditation"]
            },
            {
                question: "How do you prefer to communicate?",
                options: ["In person", "Phone calls", "Text messages", "Video calls", "Email"]
            },
            {
                question: "What's your ideal vacation?",
                options: ["Beach resort", "Mountain retreat", "City exploration", "Adventure travel", "Staycation"]
            }
        ];

        let currentQuestion = 0;
        let answers = {};
        let deviceId = getOrCreateDeviceId();

        function getOrCreateDeviceId() {
            let id = localStorage.getItem('survey_device_id');
            if (!id) {
                id = 'dev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                localStorage.setItem('survey_device_id', id);
            }
            return id;
        }

        function renderQuestion() {
            const question = questions[currentQuestion];
            const progress = ((currentQuestion + 1) / questions.length) * 100;
            
            document.getElementById('progress').style.width = progress + '%';
            document.getElementById('questionNumber').textContent = \`Question \${currentQuestion + 1} of \${questions.length}\`;
            document.getElementById('questionText').textContent = question.question;
            
            const optionsContainer = document.getElementById('options');
            optionsContainer.innerHTML = '';
            
            question.options.forEach((option, index) => {
                const optionDiv = document.createElement('div');
                optionDiv.className = 'option';
                optionDiv.textContent = option;
                optionDiv.onclick = () => selectOption(index);
                
                if (answers[currentQuestion] === index) {
                    optionDiv.classList.add('selected');
                }
                
                optionsContainer.appendChild(optionDiv);
            });
            
            // Update buttons
            document.getElementById('backBtn').disabled = currentQuestion === 0;
            document.getElementById('nextBtn').disabled = answers[currentQuestion] === undefined;
            
            // Show submit button on last question
            if (currentQuestion === questions.length - 1) {
                document.getElementById('nextBtn').classList.add('hidden');
                document.getElementById('submitBtn').classList.remove('hidden');
                document.getElementById('submitBtn').disabled = answers[currentQuestion] === undefined;
            } else {
                document.getElementById('nextBtn').classList.remove('hidden');
                document.getElementById('submitBtn').classList.add('hidden');
            }
        }

        function selectOption(index) {
            answers[currentQuestion] = index;
            renderQuestion();
        }

        async function saveProgress() {
            // Save current progress to D1
            const currentResponses = [];
            for (let i = 0; i <= currentQuestion; i++) {
                if (answers[i] !== undefined) {
                    currentResponses.push({
                        questionId: i,
                        questionText: questions[i].question,
                        answerIndex: answers[i],
                        answerText: questions[i].options[answers[i]]
                    });
                }
            }

            try {
                const response = await fetch('/api/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        deviceId: deviceId,
                        responses: currentResponses
                    })
                });
                
                if (!response.ok) {
                    console.error('Failed to save progress');
                }
            } catch (error) {
                console.error('Error saving progress:', error);
            }
        }

        async function nextQuestion() {
            if (currentQuestion < questions.length - 1) {
                // Save progress before moving to next question
                await saveProgress();
                currentQuestion++;
                renderQuestion();
            }
        }

        function previousQuestion() {
            if (currentQuestion > 0) {
                currentQuestion--;
                renderQuestion();
            }
        }

        async function submitSurvey() {
            // Show saving message
            const submitBtn = document.getElementById('submitBtn');
            submitBtn.textContent = 'Saving...';
            // Save progress before moving to next question
            await saveProgress();
            submitBtn.disabled = true;

            // Prepare survey data
            const surveyData = {
                deviceId: deviceId,
                responses: questions.map((question, index) => ({
                    questionId: index,
                    questionText: question.question,
                    answerIndex: answers[index],
                    answerText: question.options[answers[index]]
                }))
            };

            // Send to server
            try {
                const response = await fetch('/api/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(surveyData)
                });

                if (!response.ok) {
                    throw new Error('Failed to save survey');
                }

                // Show results
                document.getElementById('survey').classList.add('hidden');
                document.getElementById('results').classList.remove('hidden');
                
                const resultsList = document.getElementById('resultsList');
                resultsList.innerHTML = '';
                
                questions.forEach((question, index) => {
                    const resultItem = document.createElement('div');
                    resultItem.className = 'result-item';
                    resultItem.innerHTML = \`
                        <div class="result-question">\${question.question}</div>
                        <div class="result-answer">\${question.options[answers[index]]}</div>
                    \`;
                    resultsList.appendChild(resultItem);
                });

                // Add saved confirmation
                const savedNote = document.createElement('p');
                savedNote.style.color = '#28a745';
                savedNote.style.fontSize = '14px';
                savedNote.style.marginTop = '10px';
                savedNote.textContent = '✓ Responses saved successfully!';
                resultsList.appendChild(savedNote);

            } catch (error) {
                alert('Error saving survey: ' + error.message);
                submitBtn.textContent = 'Submit';
                submitBtn.disabled = false;
            }
        }

        function restartSurvey() {
            currentQuestion = 0;
            document.getElementById('survey').classList.remove('hidden');
            document.getElementById('results').classList.add('hidden');
            renderQuestion();
        }

        // Load previous responses on page load
        async function loadPreviousResponses() {
            try {
                const response = await fetch('/api/responses?deviceId=' + encodeURIComponent(deviceId));
                if (response.ok) {
                    const data = await response.json();
                    if (data.responses && data.responses.length > 0) {
                        // Populate answers from previous responses
                        data.responses.forEach(resp => {
                            answers[resp.questionId] = resp.answerIndex;
                        });
                        console.log('Loaded previous responses for device:', deviceId);
                    }
                }
            } catch (error) {
                console.error('Error loading previous responses:', error);
            }
        }

        // Initialize
        (async function init() {
            await loadPreviousResponses();
            renderQuestion();
        })();
    </script>
</body>
</html>`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Handle GET request to load previous responses
    if (request.method === 'GET' && url.pathname === '/api/responses') {
      try {
        const deviceId = url.searchParams.get('deviceId');
        if (!deviceId) {
          return new Response(JSON.stringify({ error: 'deviceId required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        const { results } = await env.DB.prepare(
          'SELECT question_id, question_text, answer_index, answer_text FROM survey_responses WHERE device_id = ? ORDER BY question_id'
        ).bind(deviceId).all();

        const responses = results.map(row => ({
          questionId: row.question_id,
          questionText: row.question_text,
          answerIndex: row.answer_index,
          answerText: row.answer_text
        }));

        return new Response(JSON.stringify({ responses }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Handle POST request to save progress (upsert)
    if (request.method === 'POST' && url.pathname === '/api/save') {
      try {
        const data = await request.json();
        
        // Delete existing responses for this device
        await env.DB.prepare(
          'DELETE FROM survey_responses WHERE device_id = ?'
        ).bind(data.deviceId).run();

        // Insert new responses
        if (data.responses && data.responses.length > 0) {
          const stmt = env.DB.prepare(
            'INSERT INTO survey_responses (device_id, question_id, question_text, answer_index, answer_text) VALUES (?, ?, ?, ?, ?)'
          );
          
          const batch = data.responses.map(response => 
            stmt.bind(
              data.deviceId,
              response.questionId,
              response.questionText,
              response.answerIndex,
              response.answerText
            )
          );
          
          await env.DB.batch(batch);
        }
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Handle POST request to submit final survey (update existing records)
    if (request.method === 'POST' && url.pathname === '/api/submit') {
      try {
        const data = await request.json();
        
        // Update existing responses for each question
        const updateStmt = env.DB.prepare(
          'UPDATE survey_responses SET answer_index = ?, answer_text = ? WHERE device_id = ? AND question_id = ?'
        );
        
        const batch = data.responses.map(response => 
          updateStmt.bind(
            response.answerIndex,
            response.answerText,
            data.deviceId,
            response.questionId
          )
        );
        
        await env.DB.batch(batch);
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Handle GET request to fetch aggregated results
    if (request.method === 'GET' && url.pathname === '/api/results') {
      try {
        // Get total responses count
        const { results: countResults } = await env.DB.prepare(
          'SELECT COUNT(*) as total FROM survey_responses'
        ).all();
        const totalResponses = countResults[0]?.total || 0;

        // Get unique devices count
        const { results: deviceResults } = await env.DB.prepare(
          'SELECT COUNT(DISTINCT device_id) as unique_devices FROM survey_responses'
        ).all();
        const uniqueDevices = deviceResults[0]?.unique_devices || 0;

        // Get all questions (distinct question_text with question_id)
        const { results: questionsList } = await env.DB.prepare(
          'SELECT DISTINCT question_id, question_text FROM survey_responses ORDER BY question_id'
        ).all();

        // For each question, get the answer distribution
        const questionsData = await Promise.all(
          questionsList.map(async (q) => {
            const { results: answerCounts } = await env.DB.prepare(
              'SELECT answer_text, COUNT(*) as count FROM survey_responses WHERE question_id = ? GROUP BY answer_text ORDER BY answer_text'
            ).bind(q.question_id).all();

            return {
              questionId: q.question_id,
              questionText: q.question_text,
              options: answerCounts.map(a => ({
                answerText: a.answer_text,
                count: a.count
              }))
            };
          })
        );

        // Calculate expected responses (unique devices * number of questions)
        const numberOfQuestions = questionsList.length;
        const expectedResponses = uniqueDevices * numberOfQuestions;

        return new Response(JSON.stringify({
          stats: {
            totalResponses,
            uniqueDevices,
            expectedResponses
          },
          questions: questionsData
        }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error('Error fetching results:', error);
        return new Response(JSON.stringify({ 
          error: error.message,
          stack: error.stack,
          name: error.name
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Serve results page
    if (url.pathname === '/results') {
      return new Response(resultsHtml, {
        headers: {
          'content-type': 'text/html;charset=UTF-8',
        },
      });
    }

    // Serve main survey page for all other GET requests
    return new Response(html, {
      headers: {
        'content-type': 'text/html;charset=UTF-8',
      },
    });
  },
};
