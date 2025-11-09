import json
import os
from typing import Dict, Any
from datetime import datetime

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Handle Steam top-up and region change transactions
    Args: event with httpMethod, body, queryStringParameters; context with request_id
    Returns: HTTP response with transaction data
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
                """SELECT id, type, amount, steam_login, status, region, description, created_at
                   FROM transactions 
                   WHERE user_id = %s 
                   ORDER BY created_at DESC 
                   LIMIT 20""",
                (int(user_id),)
            )
            
            transactions = []
            for row in cur.fetchall():
                transactions.append({
                    'id': row[0],
                    'type': row[1],
                    'amount': float(row[2]) if row[2] else None,
                    'steam_login': row[3],
                    'status': row[4],
                    'region': row[5],
                    'description': row[6],
                    'created_at': row[7].isoformat() if row[7] else None
                })
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'transactions': transactions})
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            user_id = body_data.get('user_id')
            trans_type = body_data.get('type')
            amount = body_data.get('amount')
            steam_login = body_data.get('steam_login')
            region = body_data.get('region')
            
            if not user_id or not trans_type:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'user_id and type are required'})
                }
            
            description = f"{'Пополнение Steam' if trans_type == 'topup' else 'Смена региона'}"
            if trans_type == 'topup':
                description += f" на сумму {amount}₽"
            elif trans_type == 'region_change':
                description += f" на {region}"
            
            cur.execute(
                """INSERT INTO transactions (user_id, type, amount, steam_login, status, region, description)
                   VALUES (%s, %s, %s, %s, %s, %s, %s)
                   RETURNING id, type, amount, steam_login, status, region, description, created_at""",
                (user_id, trans_type, amount, steam_login, 'pending', region, description)
            )
            
            new_trans = cur.fetchone()
            conn.commit()
            cur.close()
            conn.close()
            
            transaction = {
                'id': new_trans[0],
                'type': new_trans[1],
                'amount': float(new_trans[2]) if new_trans[2] else None,
                'steam_login': new_trans[3],
                'status': new_trans[4],
                'region': new_trans[5],
                'description': new_trans[6],
                'created_at': new_trans[7].isoformat() if new_trans[7] else None
            }
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'success': True, 'transaction': transaction})
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
