import json
import os
import hashlib
import hmac
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Telegram authentication verification and user management
    Args: event with httpMethod, body; context with request_id
    Returns: HTTP response with user data or error
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
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        import psycopg2
        
        body_data = json.loads(event.get('body', '{}'))
        telegram_data = body_data.get('telegram_data', {})
        
        telegram_id = telegram_data.get('id')
        if not telegram_id:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Telegram ID is required'})
            }
        
        bot_token = os.environ.get('TELEGRAM_BOT_TOKEN', '')
        if bot_token and telegram_data.get('hash') and not verify_telegram_auth(telegram_data, bot_token):
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid Telegram authentication'})
            }
        
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        cur.execute(
            "SELECT id, telegram_id, username, first_name, last_name, photo_url, balance FROM users WHERE telegram_id = %s",
            (telegram_id,)
        )
        user = cur.fetchone()
        
        if user:
            cur.execute(
                """UPDATE users 
                   SET username = %s, first_name = %s, last_name = %s, photo_url = %s, updated_at = CURRENT_TIMESTAMP
                   WHERE telegram_id = %s""",
                (
                    telegram_data.get('username'),
                    telegram_data.get('first_name'),
                    telegram_data.get('last_name'),
                    telegram_data.get('photo_url'),
                    telegram_id
                )
            )
            conn.commit()
            
            user_data = {
                'id': user[0],
                'telegram_id': user[1],
                'username': user[2],
                'first_name': user[3],
                'last_name': user[4],
                'photo_url': user[5],
                'balance': float(user[6])
            }
        else:
            cur.execute(
                """INSERT INTO users (telegram_id, username, first_name, last_name, photo_url)
                   VALUES (%s, %s, %s, %s, %s)
                   RETURNING id, telegram_id, username, first_name, last_name, photo_url, balance""",
                (
                    telegram_id,
                    telegram_data.get('username'),
                    telegram_data.get('first_name'),
                    telegram_data.get('last_name'),
                    telegram_data.get('photo_url')
                )
            )
            new_user = cur.fetchone()
            conn.commit()
            
            user_data = {
                'id': new_user[0],
                'telegram_id': new_user[1],
                'username': new_user[2],
                'first_name': new_user[3],
                'last_name': new_user[4],
                'photo_url': new_user[5],
                'balance': float(new_user[6])
            }
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'success': True, 'user': user_data})
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }


def verify_telegram_auth(auth_data: Dict[str, Any], bot_token: str) -> bool:
    check_hash = auth_data.get('hash', '')
    auth_data_copy = {k: v for k, v in auth_data.items() if k != 'hash'}
    
    data_check_string = '\n'.join([f"{k}={v}" for k, v in sorted(auth_data_copy.items())])
    
    secret_key = hashlib.sha256(bot_token.encode()).digest()
    hmac_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
    
    return hmac_hash == check_hash