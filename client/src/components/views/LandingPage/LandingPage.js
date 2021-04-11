import React, { useEffect } from 'react'
import axios from 'axios';

function LandingPage() {

    useEffect(() => {
        axios.get('/api/hello') // CORS(Cross-Origin Resource Sharing) 정책 proxy 설정으로 해결
            .then(response => console.log(response))
    }, [])

    return (
        <div>
            LandingPage
        </div>
    )
}

export default LandingPage