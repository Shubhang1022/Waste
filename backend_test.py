import requests
import sys
import json
import base64
from datetime import datetime
from io import BytesIO
from PIL import Image

class EWasteAPITester:
    def __init__(self, base_url="https://ecoreuse-hub.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test_name": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if success:
                try:
                    response_data = response.json()
                    details += f", Response keys: {list(response_data.keys()) if isinstance(response_data, dict) else 'Non-dict response'}"
                except:
                    details += ", Non-JSON response"
            else:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f", Raw response: {response.text[:200]}"

            self.log_test(name, success, details)
            return success, response.json() if success else {}

        except requests.exceptions.Timeout:
            self.log_test(name, False, "Request timeout (30s)")
            return False, {}
        except requests.exceptions.ConnectionError:
            self.log_test(name, False, "Connection error - server may be down")
            return False, {}
        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def create_test_image_base64(self):
        """Create a simple test image and return base64 encoded string"""
        # Create a simple test image with some visual features
        img = Image.new('RGB', (200, 200), color='white')
        
        # Add some visual features (simple pattern)
        pixels = img.load()
        for i in range(200):
            for j in range(200):
                if (i + j) % 20 < 10:
                    pixels[i, j] = (100, 150, 200)  # Blue pattern
                else:
                    pixels[i, j] = (200, 100, 50)   # Orange pattern
        
        # Convert to base64
        buffer = BytesIO()
        img.save(buffer, format='JPEG')
        img_str = base64.b64encode(buffer.getvalue()).decode()
        return img_str

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test(
            "Root API Endpoint",
            "GET",
            "",
            200
        )

    def test_analyze_waste_text(self):
        """Test waste analysis with text input"""
        data = {
            "waste_name": "Old laptop",
            "waste_description": "Broken Dell laptop with damaged screen but working motherboard"
        }
        return self.run_test(
            "Analyze Waste (Text)",
            "POST",
            "analyze-waste",
            200,
            data
        )

    def test_analyze_waste_image(self):
        """Test waste analysis with image input"""
        image_base64 = self.create_test_image_base64()
        data = {
            "image_base64": image_base64
        }
        return self.run_test(
            "Analyze Waste (Image)",
            "POST",
            "analyze-waste",
            200,
            data
        )

    def test_generate_innovations(self, waste_id="test-waste-id"):
        """Test innovation generation"""
        data = {
            "waste_id": waste_id,
            "waste_description": "Old laptop with broken screen but working components including motherboard, RAM, hard drive, and cooling fan",
            "innovation_types": ["diy_tools", "electronics"],
            "budget": 100.0,
            "currency": "USD",
            "skill_level": "Beginner"
        }
        return self.run_test(
            "Generate Innovations",
            "POST",
            "generate-innovations",
            200,
            data
        )

    def test_get_innovation_detail(self, innovation_id):
        """Test getting innovation details"""
        return self.run_test(
            "Get Innovation Detail",
            "GET",
            f"innovation/{innovation_id}",
            200
        )

    def test_save_innovation(self, innovation_id):
        """Test saving innovation"""
        return self.run_test(
            "Save Innovation",
            "POST",
            f"save-innovation?innovation_id={innovation_id}",
            200
        )

    def test_get_saved_innovations(self):
        """Test getting saved innovations"""
        return self.run_test(
            "Get Saved Innovations",
            "GET",
            "saved-innovations",
            200
        )

    def test_invalid_requests(self):
        """Test error handling with invalid requests"""
        print("\n🔍 Testing Error Handling...")
        
        # Test analyze-waste without required data
        success1, _ = self.run_test(
            "Analyze Waste (No Data)",
            "POST",
            "analyze-waste",
            400,
            {}
        )
        
        # Test non-existent innovation
        success2, _ = self.run_test(
            "Get Non-existent Innovation",
            "GET",
            "innovation/non-existent-id",
            404
        )
        
        return success1 and success2

def main():
    print("🚀 Starting E-Waste Innovation API Tests")
    print("=" * 50)
    
    tester = EWasteAPITester()
    
    # Test basic connectivity
    success, _ = tester.test_root_endpoint()
    if not success:
        print("❌ Cannot connect to API. Stopping tests.")
        return 1

    # Test waste analysis endpoints
    print("\n📋 Testing Waste Analysis...")
    text_success, text_response = tester.test_analyze_waste_text()
    image_success, image_response = tester.test_analyze_waste_image()
    
    # Get waste_id for further tests
    waste_id = None
    if text_success and 'waste_id' in text_response:
        waste_id = text_response['waste_id']
    elif image_success and 'waste_id' in image_response:
        waste_id = image_response['waste_id']

    # Test innovation generation
    print("\n🔬 Testing Innovation Generation...")
    innovation_success, innovation_response = tester.test_generate_innovations(waste_id or "test-waste-id")
    
    # Get innovation_id for further tests
    innovation_id = None
    if innovation_success and 'innovations' in innovation_response:
        innovations = innovation_response['innovations']
        if innovations and len(innovations) > 0:
            innovation_id = innovations[0].get('id')

    # Test innovation detail and save functionality
    if innovation_id:
        print("\n📖 Testing Innovation Details...")
        tester.test_get_innovation_detail(innovation_id)
        
        print("\n💾 Testing Save Functionality...")
        tester.test_save_innovation(innovation_id)

    # Test dashboard functionality
    print("\n📊 Testing Dashboard...")
    tester.test_get_saved_innovations()

    # Test error handling
    print("\n⚠️ Testing Error Handling...")
    tester.test_invalid_requests()

    # Print summary
    print("\n" + "=" * 50)
    print(f"📊 Test Summary: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print(f"⚠️ {tester.tests_run - tester.tests_passed} tests failed")
        print("\nFailed tests:")
        for result in tester.test_results:
            if not result['success']:
                print(f"  - {result['test_name']}: {result['details']}")
        return 1

if __name__ == "__main__":
    sys.exit(main())