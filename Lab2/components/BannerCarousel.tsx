import React from "react";
import { FlatList } from "react-native";
import BannerItem from "./BannerItem";
import { banners } from "@/data/banners";



const BannerCarousel = () => (
  <FlatList
    data={banners}
    renderItem={({ item }) => <BannerItem {...item} />}
    keyExtractor={(_, index) => index.toString()}
    horizontal
    showsHorizontalScrollIndicator={false}
  />
);

export default BannerCarousel;
