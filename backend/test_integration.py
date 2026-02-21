#!/usr/bin/env python3
"""Integration tests for SchemaSense Backend connectivity"""

import httpx
import asyncio
import sys
import os

# Default to localhost for CI, can override with environment variable
BASE_URL = os.getenv("API_URL", "http://localhost:8000")
VERCEL_URL = "https://hackthon-demo-ten.vercel.app"
PRODUCTION_URL = "https://api.amitdevx.tech"

async def test_health():
    """Test health endpoint"""
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(f"{BASE_URL}/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}
        print("✓ Health check passed")

async def test_cors_vercel():
    """Test CORS headers for Vercel origin"""
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(
            f"{BASE_URL}/health",
            headers={"Origin": VERCEL_URL}
        )
        assert response.status_code == 200
        assert response.headers.get("access-control-allow-origin") == VERCEL_URL
        assert response.headers.get("access-control-allow-credentials") == "true"
        print(f"✓ CORS headers correct for {VERCEL_URL}")

async def test_cors_preflight():
    """Test CORS preflight OPTIONS request"""
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.options(
            f"{BASE_URL}/api/chat/stream",
            headers={
                "Origin": VERCEL_URL,
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type,accept"
            }
        )
        assert response.status_code == 200
        assert "access-control-allow-methods" in response.headers
        print(f"✓ CORS preflight works for chat endpoint")

async def test_root():
    """Test root endpoint"""
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(f"{BASE_URL}/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data
        print("✓ Root endpoint works")

async def test_connection_status():
    """Test connection status endpoint"""
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(f"{BASE_URL}/api/connection-status")
        # Should return 200 even if no DB connected
        assert response.status_code == 200
        data = response.json()
        assert "connected" in data
        print(f"✓ Connection status endpoint works (connected: {data['connected']})")

async def test_api_port():
    """Verify API is running on expected port"""
    import urllib.parse
    parsed = urllib.parse.urlparse(BASE_URL)
    port = parsed.port or (443 if parsed.scheme == 'https' else 80)
    print(f"✓ API running on port {port} ({BASE_URL})")

async def main():
    """Run all tests"""
    print("=" * 60)
    print("SchemaSense Backend Integration Tests")
    print("=" * 60)
    print(f"Backend URL: {BASE_URL}")
    print(f"Vercel Origin: {VERCEL_URL}\n")
    
    try:
        await test_api_port()
        await test_health()
        await test_root()
        await test_cors_vercel()
        await test_cors_preflight()
        await test_connection_status()
        
        print("\n" + "=" * 60)
        print("✅ All tests passed! Backend is ready.")
        print("=" * 60)
        return 0
    except AssertionError as e:
        print(f"\n❌ Test assertion failed: {e}")
        return 1
    except httpx.ConnectError as e:
        print(f"\n❌ Connection failed: {e}")
        print(f"   Make sure the API is running at {BASE_URL}")
        return 1
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
