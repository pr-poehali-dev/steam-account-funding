import json
import os
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Support chat messages management
    Args: event with httpMethod, body, queryStringParameters; context with request_id
    Returns: HTTP response with messages data
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    try:
        import psycopg2
        
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        if method == 'GET':
            user_id = event.get('queryStringParameters', {}).get('user_id')
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'user_id is required'})
                }
            
            cur.execute(
                """SELECT id, message, is_admin, created_at
                   FROM support_messages 
                   WHERE user_id = %s 
                   ORDER BY created_at ASC""",
                (int(user_id),)
            )
            
            messages = []
            for row in cur.fetchall():
                messages.append({
                    'id': row[0],
                    'message': row[1],
                    'is_admin': row[2],
                    'created_at': row[3].isoformat() if row[3] else None
                })
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'messages': messages})
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            user_id = body_data.get('user_id')
            message = body_data.get('message')
            
            if not user_id or not message:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'user_id and message are required'})
                }
            
            cur.execute(
                """INSERT INTO support_messages (user_id, message, is_admin)
                   VALUES (%s, %s, %s)
                   RETURNING id, message, is_admin, created_at""",
                (user_id, message, False)
            )
            
            new_msg = cur.fetchone()
            conn.commit()
            
            cur.execute(
                """INSERT INTO support_messages (user_id, message, is_admin)
                   VALUES (%s, %s, %s)
                   RETURNING id, message, is_admin, created_at""",
                (user_id, 'Спасибо за обращение! Оператор ответит вам в ближайшее время.', True)
            )
            
            auto_reply = cur.fetchone()
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({
                    'success': True,
                    'message': {
                        'id': new_msg[0],
                        'message': new_msg[1],
                        'is_admin': new_msg[2],
                        'created_at': new_msg[3].isoformat() if new_msg[3] else None
                    },
                    'auto_reply': {
                        'id': auto_reply[0],
                        'message': auto_reply[1],
                        'is_admin': auto_reply[2],
                        'created_at': auto_reply[3].isoformat() if auto_reply[3] else None
                    }
                })
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'})
            }
            
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
