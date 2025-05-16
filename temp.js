async function fetchMembers() {
  try {
    const response = await fetch(
      "http://localhost:3000/api/v1/members/?systemName=Er. Jitendra nath
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Response data:", data.data);
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

fetchMembers(); // Call the function
