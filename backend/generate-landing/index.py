import json
import os
import requests
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Generate landing page using Ollama qwen3-coder model
    Args: event - dict with httpMethod, body (theme, geo, domain)
          context - object with request_id attribute
    Returns: HTTP response with generated landing or error
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    theme: str = body_data.get('theme', '')
    geo: str = body_data.get('geo', '')
    domain: str = body_data.get('domain', '')
    
    if not theme or not geo or not domain:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'theme, geo and domain are required'}),
            'isBase64Encoded': False
        }
    
    ollama_url: str = os.environ.get('OLLAMA_URL', 'http://localhost:11434')
    database_url: str = os.environ.get('DATABASE_URL', '')
    
    prompt = f"""Create a modern, minimalist landing page HTML for:
Theme: {theme}
Location: {geo}
Domain: {domain}

Requirements:
- Single HTML file with inline CSS and JavaScript
- Clean design with gradient from #2563EB to lighter blue
- Hero section with CTA button
- Order form with fields: name, email, phone, message
- Form submits to /api/submit-form with POST
- Success redirect to /thank-you
- Footer with links: Terms, Privacy, Cookies, Blog
- Mobile responsive
- Use Inter font from Google Fonts
- Modern animations and smooth scrolling

Generate only the HTML code, no explanations."""

    try:
        response = requests.post(
            f'{ollama_url}/api/generate',
            json={
                'model': 'qwen2.5-coder:latest',
                'prompt': prompt,
                'stream': False
            },
            timeout=60
        )
        
        if response.status_code != 200:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': f'Ollama error: {response.status_code}'}),
                'isBase64Encoded': False
            }
        
        ollama_response = response.json()
        html_content: str = ollama_response.get('response', '')
        
        conn = psycopg2.connect(database_url)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute(
            "INSERT INTO landings (domain, theme, geo, html_content) VALUES (%s, %s, %s, %s) ON CONFLICT (domain) DO UPDATE SET theme = EXCLUDED.theme, geo = EXCLUDED.geo, html_content = EXCLUDED.html_content, created_at = CURRENT_TIMESTAMP RETURNING id",
            (domain, theme, geo, html_content)
        )
        
        landing_id = cur.fetchone()['id']
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'landing_id': landing_id,
                'domain': domain,
                'preview_url': f'/preview/{domain}'
            }),
            'isBase64Encoded': False
        }
        
    except requests.exceptions.RequestException as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ollama connection error: {str(e)}'}),
            'isBase64Encoded': False
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
