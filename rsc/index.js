// src/index.js - النسخة المحسنة
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    
    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    // الصفحة الرئيسية
    if (path === '/' || path === '') {
      const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🌿 منشئ صور النباتات الطبية</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        .plant-list {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .endpoint {
            background: #e8f5e9;
            padding: 10px;
            border-radius: 5px;
            margin: 10px 0;
            font-family: monospace;
            border-right: 4px solid #4caf50;
        }
        code {
            background: #f1f1f1;
            padding: 2px 5px;
            border-radius: 3px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🌿 منشئ صور النباتات الطبية</h1>
        <p>استخدم واجهة برمجة التطبيقات للوصول إلى قاعدة بيانات النباتات</p>
    </div>
    
    <div class="plant-list">
        <h2>📖 كيفية الاستخدام:</h2>
        <p>ارسل طلب GET إلى:</p>
        <div class="endpoint">/plant/<strong>{اسم_النبات}</strong></div>
        
        <h2>🌱 أمثلة:</h2>
        <div class="endpoint">
            <a href="/plant/نعناع" target="_blank">/plant/نعناع</a>
        </div>
        <div class="endpoint">
            <a href="/plant/زعتر" target="_blank">/plant/زعتر</a>
        </div>
        <div class="endpoint">
            <a href="/plant/بابونج" target="_blank">/plant/بابونج</a>
        </div>
        
        <h2>🔍 جرب بنفسك:</h2>
        <input type="text" id="plantInput" placeholder="أدخل اسم نبات..." style="width: 70%; padding: 8px;">
        <button onclick="searchPlant()">🔎 بحث</button>
        
        <h2>📊 النتيجة:</h2>
        <pre id="result" style="background: #f8f8f8; padding: 15px; border-radius: 5px; min-height: 100px;"></pre>
    </div>
    
    <script>
        async function searchPlant() {
            const input = document.getElementById('plantInput').value.trim();
            if (!input) return;
            
            const resultEl = document.getElementById('result');
            resultEl.textContent = 'جاري البحث...';
            
            try {
                const response = await fetch(\`/plant/\${encodeURIComponent(input)}\`);
                if (response.ok) {
                    const data = await response.json();
                    resultEl.textContent = JSON.stringify(data, null, 2);
                } else {
                    resultEl.textContent = \`خطأ: \${response.status} - \${response.statusText}\`;
                }
            } catch (error) {
                resultEl.textContent = \`خطأ في الشبكة: \${error.message}\`;
            }
        }
        
        // تفعيل البحث عند الضغط على Enter
        document.getElementById('plantInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') searchPlant();
        });
    </script>
</body>
</html>
      `;
      
      return new Response(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          ...corsHeaders
        }
      });
    }
    
    // جلب بيانات نبات
    if (path.startsWith('/plant/')) {
      try {
        const plantName = decodeURIComponent(path.split('/')[2]?.toLowerCase() || '');
        
        if (!plantName) {
          return new Response(
            JSON.stringify({ error: 'الرجاء إدخال اسم نبات' }),
            { 
              status: 400, 
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            }
          );
        }
        
        // جلب البيانات من KV
        const plantData = await env.PLANT_DB.get(plantName);
        
        if (plantData) {
          return new Response(plantData, {
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'public, max-age=3600',
              ...corsHeaders
            }
          });
        } else {
          return new Response(
            JSON.stringify({ 
              error: 'النبات غير موجود',
              suggestion: 'جرب أسماء مثل: نعناع، زعتر، بابونج' 
            }),
            { 
              status: 404, 
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            }
          );
        }
      } catch (error) {
        return new Response(
          JSON.stringify({ error: 'حدث خطأ في الخادم', details: error.message }),
          { 
            status: 500, 
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          }
        );
      }
    }
    
    // صفحة غير موجودة
    return new Response(
      JSON.stringify({ error: 'الصفحة غير موجودة', available: ['/', '/plant/{name}'] }),
      { 
        status: 404, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
};
