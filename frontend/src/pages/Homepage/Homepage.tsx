import React, { useState } from 'react'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import Layout from '../../components/Homepage/Layout'
import { Edit3, TrendingUp, Clock, Zap } from 'lucide-react'
import StoriesReel from '../../components/Homepage/Stories'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import HomePosts from '../../components/Homepage/HomePosts'
import {Helmet} from "react-helmet";




const Homepage = () => {
  const [activeTab, setActiveTab] = useState("for-you");
  return (
   <>
   <Helmet>
    <title>LinkVita </title>
    <meta name="description" content="LinkVita is a social media platform for sharing and discovering links." />
   </Helmet>
   <Navbar/>
   <Layout> 
  
   <HomePosts/>
  

    </Layout>
   </>
  )
}

export default Homepage